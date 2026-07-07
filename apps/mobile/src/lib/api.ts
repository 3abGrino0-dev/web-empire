import { getLocales } from "expo-localization";
import { mobileEnv } from "@/lib/env";
import type { AccountResponse,BootstrapResponse,ToolDetail,ToolRunResponse } from "@/types/api";
interface ApiOptions extends RequestInit { accessToken?:string|null; }
async function apiFetch<T>(path:string,options:ApiOptions={}):Promise<T>{const {accessToken,headers,...requestOptions}=options;const locale=getLocales()[0]?.languageTag??"en";const response=await fetch(`${mobileEnv.apiUrl}${path}`,{...requestOptions,headers:{Accept:"application/json","Accept-Language":locale,...(accessToken?{Authorization:`Bearer ${accessToken}`}:{ }),...headers}});const payload=await response.json() as T&{error?:string};if(!response.ok)throw new Error(payload.error??`HTTP_${response.status}`);return payload;}
export const getBootstrap=(locale:string)=>apiFetch<BootstrapResponse>(`/api/mobile/bootstrap?locale=${encodeURIComponent(locale)}`);
export const getTool=(slug:string,locale:string)=>apiFetch<ToolDetail>(`/api/mobile/tools/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`);
export const runTool=(slug:string,locale:string,input:Record<string,unknown>,accessToken?:string|null)=>apiFetch<ToolRunResponse>(`/api/tools/${encodeURIComponent(slug)}/run`,{method:"POST",accessToken,headers:{"Content-Type":"application/json"},body:JSON.stringify({input,locale})});
export const getAccount=(accessToken:string)=>apiFetch<AccountResponse>("/api/mobile/me",{accessToken});
export const createCheckout=(planId:string,locale:string,accessToken:string)=>apiFetch<{url:string}>("/api/billing/checkout",{method:"POST",accessToken,headers:{"Content-Type":"application/json"},body:JSON.stringify({planId,locale})});
