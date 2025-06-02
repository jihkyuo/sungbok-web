'use client';

/// <reference types="gapi" />
/// <reference types="gapi.client.youtube-v3" />

import Script from 'next/script';

export const YoutubeInitialize = () => {
  return (
    <Script
      src="https://apis.google.com/js/api.js"
      strategy="afterInteractive"
      onLoad={() => {
        const initClient = async () => {
          console.log('Starting gapi initialization...');
          await new Promise(resolve => gapi.load('client', resolve));
          console.log('gapi client loaded');

          const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;

          const initResult = await gapi.client.init({
            apiKey,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest'],
          });
          console.log('gapi client initialized:', initResult);
          console.log('API Key:', apiKey);

          // 초기화 완료 확인을 위한 이벤트 발생
          window.dispatchEvent(new Event('gapi-initialized'));
        };

        initClient().catch(error => {
          console.error('gapi initialization failed:', error);
        });
      }}
    />
  );
};
