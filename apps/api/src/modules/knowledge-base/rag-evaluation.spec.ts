import { Test, TestingModule } from '@nestjs/testing';
import { RagService, SearchResult } from './rag.service';
import { PrismaService } from '../../prisma/prisma.service';
import { EmbeddingService } from './embedding.service';
import { getQueueToken } from '@nestjs/bullmq';

describe('RAG Evaluation Benchmark — Context Retrieval, Precision, Recall & Anti-Hallucination', () => {
  let ragService: RagService;

  // Curated Medical & Clinical FAQ Knowledge Corpus
  const mockKnowledgeCorpus: SearchResult[] = [
    {
      chunkId: 'chunk-acne-1',
      documentId: 'doc-skin',
      documentTitle: 'Acne & Chemical Peel Protocols',
      category: 'Dermatology',
      chunkText: 'For severe cystic acne, our clinic performs Salicylic and Mandelic acid peels. Patients must discontinue retinoids 48 hours prior. Consultation fee is ₹1,000.',
      similarity: 0.88,
    },
    {
      chunkId: 'chunk-prp-1',
      documentId: 'doc-hair',
      documentTitle: 'PRP Hair Therapy Guidance',
      category: 'Trichology',
      chunkText: 'Platelet-Rich Plasma (PRP) hair restoration requires 4 sessions spaced 30 days apart. Downtime is minimal; avoid washing hair for 12 hours. Cost is ₹6,500 per session.',
      similarity: 0.82,
    },
    {
      chunkId: 'chunk-dental-1',
      documentId: 'doc-dental',
      documentTitle: 'Root Canal & Crown Treatments',
      category: 'Dentistry',
      chunkText: 'Single-sitting root canal treatment (RCT) uses rotary nickel-titanium endodontics. Includes digital RVG X-rays. Zirconia crowns are priced at ₹8,000 with a 10-year warranty.',
      similarity: 0.85,
    },
    {
      chunkId: 'chunk-timings-1',
      documentId: 'doc-ops',
      documentTitle: 'Clinic Hours and Emergency Protocols',
      category: 'Operations',
      chunkText: 'The outpatient clinic operates Monday through Saturday, 09:00 to 20:00. Sundays from 10:00 to 14:00 by prior appointment only. Emergency triage redirects to 108/112.',
      similarity: 0.79,
    },
    {
      chunkId: 'chunk-unrelated-1',
      documentId: 'doc-legal',
      documentTitle: 'Employee Handbook & HR Policies',
      category: 'Internal',
      chunkText: 'Employees are entitled to 18 days of paid privilege leave annually. Reimbursable travel expenses must be submitted within 14 days of travel completion.',
      similarity: 0.35,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RagService,
        {
          provide: PrismaService,
          useValue: {
            $executeRawUnsafe: jest.fn().mockResolvedValue(1),
          },
        },
        {
          provide: EmbeddingService,
          useValue: {
            createEmbedding: jest.fn().mockResolvedValue(new Array(1536).fill(0.01)),
          },
        },
        {
          provide: getQueueToken('rag-embedding'),
          useValue: {
            add: jest.fn().mockResolvedValue({ id: 'job-1' }),
          },
        },
      ],
    }).compile();

    ragService = module.get<RagService>(RagService);
  });

  it('should be defined', () => {
    expect(ragService).toBeDefined();
  });

  describe('1. Medical FAQ Retrieval Precision & Recall (Recall@3 = 100%)', () => {
    const evaluationQueries = [
      {
        query: 'How much does PRP hair treatment cost and how many sessions are needed?',
        expectedChunkId: 'chunk-prp-1',
        expectedEntity: '₹6,500',
      },
      {
        query: 'Can I get a chemical peel for acne if I use retinol?',
        expectedChunkId: 'chunk-acne-1',
        expectedEntity: 'retinoids',
      },
      {
        query: 'What is the price of zirconia crowns for root canal?',
        expectedChunkId: 'chunk-dental-1',
        expectedEntity: 'Zirconia',
      },
      {
        query: 'What time does the clinic open on Saturday and Sunday?',
        expectedChunkId: 'chunk-timings-1',
        expectedEntity: '09:00 to 20:00',
      },
    ];

    evaluationQueries.forEach(({ query, expectedChunkId, expectedEntity }) => {
      it(`should achieve top-rank precision for query: "${query.substring(0, 45)}..."`, () => {
        const reranked = ragService.rerank(query, mockKnowledgeCorpus, 3);
        expect(reranked.length).toBeGreaterThanOrEqual(1);

        // Assert Ground Truth Chunk is ranked #1 or within Top-3 (Recall@3)
        const topChunk = reranked[0];
        expect(topChunk.chunkId).toBe(expectedChunkId);
        expect(topChunk.chunkText).toContain(expectedEntity);
        expect(topChunk.similarity).toBeGreaterThanOrEqual(0.60);
      });
    });
  });

  describe('2. Anti-Hallucination & Out-of-Distribution Rejection', () => {
    it('should reject ungrounded medical prescription queries to prevent pharmaceutical hallucination', () => {
      const ungroundedQuery = 'What dosage of amoxicillin 500mg should I take for wisdom tooth ache?';
      const reranked = ragService.rerank(ungroundedQuery, mockKnowledgeCorpus, 5);

      // Check that none of the retrieved chunks prescribe medication dosages
      const hasPrescription = reranked.some((c) =>
        c.chunkText.toLowerCase().includes('dosage') || c.chunkText.toLowerCase().includes('amoxicillin'),
      );
      expect(hasPrescription).toBe(false);

      // The irrelevant legal document must be filtered out
      const hasLegal = reranked.some((c) => c.chunkId === 'chunk-unrelated-1');
      expect(hasLegal).toBe(false);
    });

    it('should filter out irrelevant internal HR documents when querying clinical treatments', () => {
      const treatmentQuery = 'How does the clinic treat acne scars and pigmentation?';
      const results = ragService.rerank(treatmentQuery, mockKnowledgeCorpus, 3);

      expect(results.some((r) => r.chunkId === 'chunk-unrelated-1')).toBe(false);
      expect(results[0].category).toBe('Dermatology');
    });

    it('should return empty results when query matches no corpus chunks above relevance threshold', () => {
      const irrelevantQuery = 'Quantum computing entanglement teleportation algorithm';
      const candidateList: SearchResult[] = [
        {
          chunkId: 'chunk-irrelevant',
          documentId: 'doc-irr',
          documentTitle: 'Irrelevant',
          category: 'Other',
          chunkText: 'Completely unrelated text without any matching concepts.',
          similarity: 0.15,
        },
      ];

      const results = ragService.rerank(irrelevantQuery, candidateList, 5);
      expect(results.length).toBe(0);
    });
  });

  describe('3. RAG Knowledge Context Injection Assembly', () => {
    it('should format retrieved chunks cleanly with document categories for LLM prompt injection', () => {
      const topResults = ragService.rerank('dental root canal', mockKnowledgeCorpus, 2);
      const contextString = ragService.buildKnowledgeContext(topResults);

      expect(contextString).toContain('## Relevant Knowledge Base Information');
      expect(contextString).toContain('Dentistry');
      expect(contextString).toContain('Zirconia');
    });

    it('should return empty string when zero chunks are retrieved to let AI fall back to safe knowledge boundary', () => {
      const contextString = ragService.buildKnowledgeContext([]);
      expect(contextString).toBe('');
    });
  });
});
