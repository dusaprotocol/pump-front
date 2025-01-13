import React, { useEffect, useRef } from 'react';
import {
  widget,
  ChartingLibraryWidgetOptions,
  ResolutionString
} from 'charting_library';
import { baseApi, dusaApi } from 'utils/config';
import { ONE_DAY } from 'utils/constants';

interface TradingViewContainerProps {
  address: string;
  pump: boolean;
}

const TradingViewContainer = ({ address, pump }: TradingViewContainerProps) => {
  const chartContainerRef =
    useRef<HTMLDivElement>() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    const tradingViewEndpoint = pump ? baseApi : dusaApi;
    const widgetOptions: ChartingLibraryWidgetOptions = {
      symbol: address,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      datafeed: new (window as any).Datafeeds.UDFCompatibleDatafeed(
        tradingViewEndpoint.endsWith('/')
          ? tradingViewEndpoint.slice(0, -1)
          : tradingViewEndpoint
      ),
      timeframe: '7D',
      time_frames: pump
        ? [
            {
              text: '7d',
              resolution: '5' as ResolutionString
            }
          ]
        : [
            {
              text: '7d',
              resolution: '60' as ResolutionString,
              description: '1 Week'
            },
            {
              text: '30d',
              resolution: '240' as ResolutionString,
              description: '1 Month'
            }
          ],
      interval: (pump ? '5' : '60') as ResolutionString,
      container: chartContainerRef.current,
      library_path:
        'https://luminous-liger-23c256.netlify.app/charting_library/',
      locale: 'en',
      disabled_features: [
        'header_symbol_search',
        'header_compare',
        'header_saveload'
      ],
      enabled_features: ['study_templates'],
      charts_storage_url: 'https://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      fullscreen: false,
      autosize: true,
      theme: 'dark'
    };

    const tvWidget = new widget(widgetOptions);
    tvWidget.onChartReady(() => {
      tvWidget.applyOverrides({
        'paneProperties.backgroundType': 'solid'
      });
      const from = Date.now() - 90 * ONE_DAY; // 90 days ago
      const to = new Date().getTime();
      pump
        ? tvWidget.activeChart()
        : tvWidget
            .activeChart()
            .setVisibleRange({ from, to }, { percentRightMargin: 20 })
            .then(() => console.log('New visible range is applied'));
    });

    return () => {
      tvWidget.remove();
    };
  }, [address]);

  return (
    <>
      <div ref={chartContainerRef} className='TradingViewContainer h-[500px]' />
    </>
  );
};

export default TradingViewContainer;
