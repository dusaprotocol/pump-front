export const setSwapSlippage = (slippage: number) =>
  localStorage.setItem('swapSlippage', slippage.toString());

export const getSwapSlippage = (): number =>
  Math.round(Number(localStorage.getItem('swapSlippage') ?? '5'));

export const setAccessToken = (token: string, address: string) =>
  localStorage.setItem(`accessToken${address}`, token);

export const getAccessToken = (address: string): string =>
  localStorage.getItem(`accessToken${address}`) ?? '';

export const setNSFW = (nsfw: boolean) =>
  localStorage.setItem('nsfw', nsfw.toString());

export const getNSFW = (): boolean => localStorage.getItem('nsfw') === 'true';
