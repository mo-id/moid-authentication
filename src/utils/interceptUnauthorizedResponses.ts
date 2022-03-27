import { AxiosError, AxiosResponse } from "axios";

import { Optional, SimpleHandler } from "@mo-id/typescript-toolbelt";
import { StatusCode } from "./types";

type InterceptUnauthorizedResponses = [
  (response: AxiosResponse) => AxiosResponse,
  (error: AxiosError) => Optional<Promise<AxiosError>>
];

export function interceptUnauthorizedResponses(
  onUnauthorized: SimpleHandler
): InterceptUnauthorizedResponses {
  function handleSuccessResponse(response: AxiosResponse) {
    return response;
  }

  function handleError(error: AxiosError) {
    if (!error.response) {
      /**
       * Se non ci arriva nemmeno la response, vuol dire che la chiamata non è
       * proprio partita.
       */
      return Promise.reject(error);
    }

    if (error.response.status !== StatusCode.Unauthorized) {
      /**
       * Qualcosa è andato storto ma NON è un problema di autenticazione.
       */
      return Promise.reject(error);
    }

    onUnauthorized();
    return;
  }

  return [handleSuccessResponse, handleError];
}
