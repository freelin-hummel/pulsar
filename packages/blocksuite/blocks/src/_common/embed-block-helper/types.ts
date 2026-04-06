import type { GfxCompatibleProps } from '@pulsar/model';

export type EmbedProps<Props = object> = Props & GfxCompatibleProps;

export type { LinkPreviewData } from '@pulsar/model';

export type LinkPreviewResponseData = {
  url: string;
  title?: string;
  siteName?: string;
  description?: string;
  images?: string[];
  mediaType?: string;
  contentType?: string;
  charset?: string;
  videos?: string[];
  favicons?: string[];
};
