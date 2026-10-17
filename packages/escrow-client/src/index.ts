import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CDXK2V4UCM7WQW74JVOIYLPZBYGQTWYWXNWF4PPJUDLJNTQ526JPML3X",
  }
} as const


export interface Order {
  amount: i128;
  buyer: Option<string>;
  confirm_window_secs: u64;
  created_at: u64;
  evidence_hash: Option<Buffer>;
  funded_at: u64;
  id: u64;
  seller: string;
  ship_deadline_secs: u64;
  shipped_at: u64;
  status: Status;
  token: string;
}

export enum Status {
  Created = 0,
  Funded = 1,
  Shipped = 2,
  Completed = 3,
  Disputed = 4,
  Refunded = 5,
}


export interface Reputation {
  completed: u32;
  disputes_lost: u32;
}

export interface Client {
  /**
   * Construct and simulate a fund transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  fund: ({order_id, buyer}: {order_id: u64, buyer: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a init transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  init: ({admin, arbiter}: {admin: string, arbiter: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_order: ({order_id}: {order_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Order>>

  /**
   * Construct and simulate a create_order transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  create_order: ({seller, token, amount, ship_deadline_secs, confirm_window_secs}: {seller: string, token: string, amount: i128, ship_deadline_secs: u64, confirm_window_secs: u64}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a mark_shipped transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  mark_shipped: ({order_id, evidence_hash}: {order_id: u64, evidence_hash: Buffer}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a open_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  open_dispute: ({order_id, caller}: {order_id: u64, caller: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_reputation transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_reputation: ({addr}: {addr: string}, options?: MethodOptions) => Promise<AssembledTransaction<Reputation>>

  /**
   * Construct and simulate a resolve_dispute transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  resolve_dispute: ({order_id, release_to_seller}: {order_id: u64, release_to_seller: boolean}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a confirm_received transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  confirm_received: ({order_id}: {order_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a claim_after_timeout transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  claim_after_timeout: ({order_id}: {order_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a refund_if_not_shipped transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  refund_if_not_shipped: ({order_id}: {order_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAQAAAAAAAAAAAAAABU9yZGVyAAAAAAAADAAAAAAAAAAGYW1vdW50AAAAAAALAAAAAAAAAAVidXllcgAAAAAAA+gAAAATAAAAAAAAABNjb25maXJtX3dpbmRvd19zZWNzAAAAAAYAAAAAAAAACmNyZWF0ZWRfYXQAAAAAAAYAAAAAAAAADWV2aWRlbmNlX2hhc2gAAAAAAAPoAAAD7gAAACAAAAAAAAAACWZ1bmRlZF9hdAAAAAAAAAYAAAAAAAAAAmlkAAAAAAAGAAAAAAAAAAZzZWxsZXIAAAAAABMAAAAAAAAAEnNoaXBfZGVhZGxpbmVfc2VjcwAAAAAABgAAAAAAAAAKc2hpcHBlZF9hdAAAAAAABgAAAAAAAAAGc3RhdHVzAAAAAAfQAAAABlN0YXR1cwAAAAAAAAAAAAV0b2tlbgAAAAAAABM=",
        "AAAAAwAAAAAAAAAAAAAABlN0YXR1cwAAAAAABgAAAAAAAAAHQ3JlYXRlZAAAAAAAAAAAAAAAAAZGdW5kZWQAAAAAAAEAAAAAAAAAB1NoaXBwZWQAAAAAAgAAAAAAAAAJQ29tcGxldGVkAAAAAAAAAwAAAAAAAAAIRGlzcHV0ZWQAAAAEAAAAAAAAAAhSZWZ1bmRlZAAAAAU=",
        "AAAAAQAAAAAAAAAAAAAAClJlcHV0YXRpb24AAAAAAAIAAAAAAAAACWNvbXBsZXRlZAAAAAAAAAQAAAAAAAAADWRpc3B1dGVzX2xvc3QAAAAAAAAE",
        "AAAAAAAAAAAAAAAEZnVuZAAAAAIAAAAAAAAACG9yZGVyX2lkAAAABgAAAAAAAAAFYnV5ZXIAAAAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAEaW5pdAAAAAIAAAAAAAAABWFkbWluAAAAAAAAEwAAAAAAAAAHYXJiaXRlcgAAAAATAAAAAA==",
        "AAAAAAAAAAAAAAAJZ2V0X29yZGVyAAAAAAAAAQAAAAAAAAAIb3JkZXJfaWQAAAAGAAAAAQAAB9AAAAAFT3JkZXIAAAA=",
        "AAAAAAAAAAAAAAAMY3JlYXRlX29yZGVyAAAABQAAAAAAAAAGc2VsbGVyAAAAAAATAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAASc2hpcF9kZWFkbGluZV9zZWNzAAAAAAAGAAAAAAAAABNjb25maXJtX3dpbmRvd19zZWNzAAAAAAYAAAABAAAABg==",
        "AAAAAAAAAAAAAAAMbWFya19zaGlwcGVkAAAAAgAAAAAAAAAIb3JkZXJfaWQAAAAGAAAAAAAAAA1ldmlkZW5jZV9oYXNoAAAAAAAD7gAAACAAAAAA",
        "AAAAAAAAAAAAAAAMb3Blbl9kaXNwdXRlAAAAAgAAAAAAAAAIb3JkZXJfaWQAAAAGAAAAAAAAAAZjYWxsZXIAAAAAABMAAAAA",
        "AAAAAAAAAAAAAAAOZ2V0X3JlcHV0YXRpb24AAAAAAAEAAAAAAAAABGFkZHIAAAATAAAAAQAAB9AAAAAKUmVwdXRhdGlvbgAA",
        "AAAAAAAAAAAAAAAPcmVzb2x2ZV9kaXNwdXRlAAAAAAIAAAAAAAAACG9yZGVyX2lkAAAABgAAAAAAAAARcmVsZWFzZV90b19zZWxsZXIAAAAAAAABAAAAAA==",
        "AAAAAAAAAAAAAAAQY29uZmlybV9yZWNlaXZlZAAAAAEAAAAAAAAACG9yZGVyX2lkAAAABgAAAAA=",
        "AAAAAAAAAAAAAAATY2xhaW1fYWZ0ZXJfdGltZW91dAAAAAABAAAAAAAAAAhvcmRlcl9pZAAAAAYAAAAA",
        "AAAAAAAAAAAAAAAVcmVmdW5kX2lmX25vdF9zaGlwcGVkAAAAAAAAAQAAAAAAAAAIb3JkZXJfaWQAAAAGAAAAAA==" ]),
      options
    )
  }
  public readonly fromJSON = {
    fund: this.txFromJSON<null>,
        init: this.txFromJSON<null>,
        get_order: this.txFromJSON<Order>,
        create_order: this.txFromJSON<u64>,
        mark_shipped: this.txFromJSON<null>,
        open_dispute: this.txFromJSON<null>,
        get_reputation: this.txFromJSON<Reputation>,
        resolve_dispute: this.txFromJSON<null>,
        confirm_received: this.txFromJSON<null>,
        claim_after_timeout: this.txFromJSON<null>,
        refund_if_not_shipped: this.txFromJSON<null>
  }
}