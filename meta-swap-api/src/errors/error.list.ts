import { HttpException, HttpExceptionOptions } from "@nestjs/common";

export class NoValidQuote extends HttpException {
  static status = 400;
  static desc = "No valid quotes found from any provider";
  constructor(options: HttpExceptionOptions) {
    super(NoValidQuote.desc, NoValidQuote.status, options);
  }
}

export class ExecutionReveted extends HttpException {
  static status = 400;
  static desc = "Execution reverted";
  constructor(options: HttpExceptionOptions) {
    super(ExecutionReveted.desc, ExecutionReveted.status, options);
  }
}

export class GetFeeDataError extends HttpException {
  static status = 400;
  static desc = "Error getting fee data";
  constructor(options?: HttpExceptionOptions) {
    super(GetFeeDataError.desc, GetFeeDataError.status, options);
  }
}

export class NotSupportedSigner extends HttpException {
  static status = 400;
  static desc = "Signer is not supported";
  constructor(options?: HttpExceptionOptions) {
    super(NotSupportedSigner.desc, NotSupportedSigner.status, options);
  }
}

export class NoValidTokenAddress extends HttpException {
  static status = 400;
  static desc = "No valid token address";
  constructor(options?: HttpExceptionOptions) {
    super(NoValidTokenAddress.desc, NoValidTokenAddress.status, options);
  }
}
