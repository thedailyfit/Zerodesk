import asyncio
import os
import sys
from dotenv import load_dotenv

load_dotenv('apps/voice-agent/.env')

from livekit.plugins import sarvam
from livekit.agents.utils import http_context

async def run_test():
    key = os.getenv('SARVAM_API_KEY')
    print('Sarvam API Key starts with:', key[:10] if key else 'None')
    async with http_context.open():
        tts = sarvam.TTS(target_language_code='en-IN', speaker='kavya', model='bulbul:v3', api_key=key)
        stt = sarvam.STT(language='en-IN', model='saaras:v4', mode='codemix', api_key=key)
        
        print('Synthesizing test audio...')
        tts_stream = tts.synthesize('What is the price of HydraFacial Deluxe treatment?')
        frames = []
        async for chunk in tts_stream:
            if hasattr(chunk, 'frame') and chunk.frame:
                frames.append(chunk.frame)
        print(f'Captured {len(frames)} frames. Sample rate: {frames[0].sample_rate}, channels: {frames[0].num_channels}')

        print('Opening STT stream...')
        stt_stream = stt.stream()
        
        async def feed():
            for f in frames:
                stt_stream.push_frame(f)
                await asyncio.sleep(0.01)
            stt_stream.flush()
            print('Finished pushing frames.')

        async def listen():
            async for ev in stt_stream:
                print('Event received:', ev.type)
                if ev.alternatives:
                    print('Transcript:', ev.alternatives[0].text)
                    if ev.type.name == 'FINAL_TRANSCRIPT':
                        break

        try:
            await asyncio.wait_for(asyncio.gather(feed(), listen()), timeout=10.0)
            print('STT test SUCCEEDED!')
        except asyncio.TimeoutError:
            print('STT test TIMED OUT after 10 seconds!')

if __name__ == '__main__':
    asyncio.run(run_test())
