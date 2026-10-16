import { AppState, Transaction } from '../types';

export interface GasPingResult {
  ok: boolean;
  message: string;
  latencyMs: number;
  data?: any;
}

export async function pingGasEndpoint(url: string): Promise<GasPingResult> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return {
      ok: false,
      message: 'URL Headless GAS belum diatur.',
      latencyMs: 0,
    };
  }

  const start = performance.now();
  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const pingUrl = `${cleanUrl}${separator}action=ping&_t=${Date.now()}`;
    const res = await fetch(pingUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    });

    const latencyMs = Math.round(performance.now() - start);

    if (!res.ok) {
      return {
        ok: false,
        message: `HTTP Error ${res.status}: ${res.statusText}`,
        latencyMs,
      };
    }

    const json = await res.json();
    if (json.success === false) {
      return {
        ok: false,
        message: json.data?.error || 'Respon GAS menyatakan kegagalan.',
        latencyMs,
      };
    }

    return {
      ok: true,
      message: json.data?.message || 'Terhubung dengan Google Sheets!',
      latencyMs,
      data: json.data,
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      message: `Gagal menghubungi endpoint: ${err.message || 'CORS / Jaringan Terputus'}. Pastikan deployment diatur ke "Anyone" (Siapa saja).`,
      latencyMs,
    };
  }
}

export async function fetchRemoteStateFromGas(url: string): Promise<Partial<AppState> | null> {
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  try {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    const getUrl = `${cleanUrl}${separator}action=getData&_t=${Date.now()}`;
    const res = await fetch(getUrl, {
      method: 'GET',
      mode: 'cors',
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
    return null;
  } catch (err) {
    console.warn('Gagal fetch remote state dari GAS, menggunakan cache lokal:', err);
    return null;
  }
}

export async function pushFullStateToGas(
  url: string,
  state: AppState,
  userEmail: string
): Promise<{ ok: boolean; message: string }> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { ok: false, message: 'URL GAS belum ditentukan.' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS doPost standard format avoids preflight blocks
      },
      body: JSON.stringify({
        action: 'saveAll',
        userEmail,
        data: {
          categories: state.categories,
          accounts: state.accounts,
          members: state.members,
          events: state.events,
          transactions: state.transactions,
          users: state.users,
        },
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success === false) {
      return { ok: false, message: json.data?.error || 'Gagal menyimpan ke server GAS' };
    }
    return { ok: true, message: json.data?.message || 'Data berhasil disinkronkan ke Google Sheets.' };
  } catch (err: any) {
    return { ok: false, message: `Gagal sync ke server: ${err.message || 'Masalah jaringan'}` };
  }
}

export async function pushSingleTxToGas(
  url: string,
  tx: Transaction,
  userEmail: string
): Promise<{ ok: boolean; message: string }> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { ok: false, message: 'URL GAS tidak ada. Disimpan lokal.' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'commitTx',
        userEmail,
        tx,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      ok: json.success !== false,
      message: json.data?.message || 'Transaksi tersimpan ke Google Sheets.',
    };
  } catch (err: any) {
    return { ok: false, message: `Disimpan lokal (Offline: ${err.message})` };
  }
}

export async function pushChangePinToGas(
  url: string,
  email: string,
  newPin: string
): Promise<{ ok: boolean; message: string }> {
  const cleanUrl = url.trim();
  if (!cleanUrl) {
    return { ok: true, message: 'PIN berhasil diubah secara lokal.' };
  }

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'changePin',
        email,
        newPin,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      ok: json.success !== false,
      message: json.data?.message || 'PIN berhasil diperbarui di Google Sheets.',
    };
  } catch (err: any) {
    return { ok: false, message: `PIN disimpan lokal: ${err.message}` };
  }
}
