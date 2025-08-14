/**
 * globalvariables.ts
 **
 * function：global variables
**/

/** const */
// default
export namespace myConst {
  export const DEVMODE: boolean = true;
  export const COMPANY_NAME: string = "nthree";
  export const APP_NAME: string = "getKeiba";
  export const LOG_LEVEL: string = "silly";
  export const DEFAULT_ENCODING: string = "utf8";
  export const CSV_ENCODING: string = "SJIS";
  export const DEFAULT_URL: string = "https://keiba.numthree.net/api";
  export const WINDOW_WIDTH: number = 1200;
  export const WINDOW_HEIGHT: number = 1000;
  export const FINISHED_MESSAGE_JA: string = '完了しました。デスクトップにCSVファイルを出力しました。';
  export const FINISHED_MESSAGE_EN: string = 'completed. csv file is on desktop.';
}

// urls
export namespace myUrls {
  export const SIRE_BASE_URL: string = "https://db.netkeiba.com/horse/sire/";
}

// selectors
export namespace mySelectors {
  export const BASE_SELECTOR: string = "#contents > div > table > tbody > tr:nth-child(3) >";
  export const TURF_SELECTOR: string = `${BASE_SELECTOR} td:nth-child(13) > a`;
  export const TURF_WIN_SELECTOR: string = `${BASE_SELECTOR} td:nth-child(14) > a`;
  export const DIRT_SELECTOR: string = `${BASE_SELECTOR} td:nth-child(15) > a`;
  export const DIRT_WIN_SELECTOR: string = `${BASE_SELECTOR} td:nth-child(16) > a`;
  export const TURF_DIST_SELECTOR: string = `${BASE_SELECTOR} td:nth-child(20)`;
  export const DIRT_DIST_SELECTOR: string = `${BASE_SELECTOR} td:nth-child(21)`;
}

// races
export namespace myRaces {
  export const HORSE_CSV_COLUMNS: string[] = ['horse', 'turf', 'turfwin', 'dirt', 'dirtwin', 'turfdistanse', 'dirtdistanse'];
  export const HORSE_SCRAPE_COLUMNS: string[] = ['turf', 'turfwin', 'dirt', 'dirtwin', 'turfdistanse', 'dirtdistanse'];
}
