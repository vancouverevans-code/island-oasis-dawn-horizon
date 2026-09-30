import { n as __exportAll } from "../_runtime.mjs";
import { i as formatAbiItem$1, r as parseAbi } from "./abitype.mjs";
import { n as sha256$1, r as keccak_256 } from "./noble__hashes.mjs";
import { t as secp256k1 } from "./noble__curves+noble__hashes.mjs";
import { a as from$2, c as encode, d as validate, f as toRpc, i as encodeData$1, l as from$3, n as wrap, o as from$1, r as decodeResult, s as getSelector, t as validate$1, u as unwrap } from "./ox.mjs";
//#region node_modules/viem/_esm/utils/getAction.js
/**
* Retrieves and returns an action from the client (if exists), and falls
* back to the tree-shakable action.
*
* Useful for extracting overridden actions from a client (ie. if a consumer
* wants to override the `sendTransaction` implementation).
*/
function getAction(client, actionFn, name) {
	const action_implicit = client[actionFn.name];
	if (typeof action_implicit === "function") return action_implicit;
	const action_explicit = client[name];
	if (typeof action_explicit === "function") return action_explicit;
	return (params) => actionFn(client, params);
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/formatAbiItem.js
function formatAbiItem(abiItem, { includeName = false } = {}) {
	if (abiItem.type !== "function" && abiItem.type !== "event" && abiItem.type !== "error") throw new InvalidDefinitionTypeError(abiItem.type);
	return `${abiItem.name}(${formatAbiParams(abiItem.inputs, { includeName })})`;
}
function formatAbiParams(params, { includeName = false } = {}) {
	if (!params) return "";
	return params.map((param) => formatAbiParam(param, { includeName })).join(includeName ? ", " : ",");
}
function formatAbiParam(param, { includeName }) {
	if (param.type.startsWith("tuple")) return `(${formatAbiParams(param.components, { includeName })})${param.type.slice(5)}`;
	return param.type + (includeName && param.name ? ` ${param.name}` : "");
}
//#endregion
//#region node_modules/viem/_esm/utils/data/isHex.js
function isHex(value, { strict = true } = {}) {
	if (!value) return false;
	if (typeof value !== "string") return false;
	return strict ? /^0x[0-9a-fA-F]*$/.test(value) : value.startsWith("0x");
}
//#endregion
//#region node_modules/viem/_esm/utils/data/size.js
/**
* @description Retrieves the size of the value (in bytes).
*
* @param value The value (hex or byte array) to retrieve the size of.
* @returns The size of the value (in bytes).
*/
function size$1(value) {
	if (isHex(value, { strict: false })) return Math.ceil((value.length - 2) / 2);
	return value.length;
}
//#endregion
//#region node_modules/viem/_esm/errors/version.js
var version = "2.57.1";
//#endregion
//#region node_modules/viem/_esm/errors/base.js
var errorConfig = {
	getDocsUrl: ({ docsBaseUrl, docsPath = "", docsSlug }) => docsPath ? `${docsBaseUrl ?? "https://viem.sh"}${docsPath}${docsSlug ? `#${docsSlug}` : ""}` : void 0,
	version: `viem@${version}`
};
var BaseError = class BaseError extends Error {
	constructor(shortMessage, args = {}) {
		const details = (() => {
			if (args.cause instanceof BaseError) return args.cause.details;
			if (args.cause?.message) return args.cause.message;
			return args.details;
		})();
		const docsPath = (() => {
			if (args.cause instanceof BaseError) return args.cause.docsPath || args.docsPath;
			return args.docsPath;
		})();
		const docsUrl = errorConfig.getDocsUrl?.({
			...args,
			docsPath
		});
		const message = [
			shortMessage || "An error occurred.",
			"",
			...args.metaMessages ? [...args.metaMessages, ""] : [],
			...docsUrl ? [`Docs: ${docsUrl}`] : [],
			...details ? [`Details: ${details}`] : [],
			...errorConfig.version ? [`Version: ${errorConfig.version}`] : []
		].join("\n");
		super(message, args.cause ? { cause: args.cause } : void 0);
		Object.defineProperty(this, "details", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "docsPath", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "metaMessages", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "shortMessage", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "version", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "BaseError"
		});
		this.details = details;
		this.docsPath = docsPath;
		this.metaMessages = args.metaMessages;
		this.name = args.name ?? this.name;
		this.shortMessage = shortMessage;
		this.version = version;
	}
	walk(fn) {
		return walk(this, fn);
	}
};
function walk(err, fn) {
	if (fn?.(err)) return err;
	if (err && typeof err === "object" && "cause" in err && err.cause !== void 0) return walk(err.cause, fn);
	return fn ? null : err;
}
//#endregion
//#region node_modules/viem/_esm/errors/abi.js
var AbiConstructorNotFoundError = class extends BaseError {
	constructor({ docsPath }) {
		super(["A constructor was not found on the ABI.", "Make sure you are using the correct ABI and that the constructor exists on it."].join("\n"), {
			docsPath,
			name: "AbiConstructorNotFoundError"
		});
	}
};
var AbiConstructorParamsNotFoundError = class extends BaseError {
	constructor({ docsPath }) {
		super(["Constructor arguments were provided (`args`), but a constructor parameters (`inputs`) were not found on the ABI.", "Make sure you are using the correct ABI, and that the `inputs` attribute on the constructor exists."].join("\n"), {
			docsPath,
			name: "AbiConstructorParamsNotFoundError"
		});
	}
};
var AbiDecodingDataSizeTooSmallError = class extends BaseError {
	constructor({ data, params, size }) {
		super([`Data size of ${size} bytes is too small for given parameters.`].join("\n"), {
			metaMessages: [`Params: (${formatAbiParams(params, { includeName: true })})`, `Data:   ${data} (${size} bytes)`],
			name: "AbiDecodingDataSizeTooSmallError"
		});
		Object.defineProperty(this, "data", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "params", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "size", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.data = data;
		this.params = params;
		this.size = size;
	}
};
var AbiDecodingZeroDataError = class extends BaseError {
	constructor({ cause } = {}) {
		super("Cannot decode zero data (\"0x\") with ABI parameters.", {
			name: "AbiDecodingZeroDataError",
			cause
		});
	}
};
var AbiEncodingArrayLengthMismatchError = class extends BaseError {
	constructor({ expectedLength, givenLength, type }) {
		super([
			`ABI encoding array length mismatch for type ${type}.`,
			`Expected length: ${expectedLength}`,
			`Given length: ${givenLength}`
		].join("\n"), { name: "AbiEncodingArrayLengthMismatchError" });
	}
};
var AbiEncodingBytesSizeMismatchError = class extends BaseError {
	constructor({ expectedSize, value }) {
		super(`Size of bytes "${value}" (bytes${size$1(value)}) does not match expected size (bytes${expectedSize}).`, { name: "AbiEncodingBytesSizeMismatchError" });
	}
};
var AbiEncodingLengthMismatchError = class extends BaseError {
	constructor({ expectedLength, givenLength }) {
		super([
			"ABI encoding params/values length mismatch.",
			`Expected length (params): ${expectedLength}`,
			`Given length (values): ${givenLength}`
		].join("\n"), { name: "AbiEncodingLengthMismatchError" });
	}
};
var AbiErrorInputsNotFoundError = class extends BaseError {
	constructor(errorName, { docsPath }) {
		super([
			`Arguments (\`args\`) were provided to "${errorName}", but "${errorName}" on the ABI does not contain any parameters (\`inputs\`).`,
			"Cannot encode error result without knowing what the parameter types are.",
			"Make sure you are using the correct ABI and that the inputs exist on it."
		].join("\n"), {
			docsPath,
			name: "AbiErrorInputsNotFoundError"
		});
	}
};
var AbiErrorNotFoundError = class extends BaseError {
	constructor(errorName, { docsPath } = {}) {
		super([`Error ${errorName ? `"${errorName}" ` : ""}not found on ABI.`, "Make sure you are using the correct ABI and that the error exists on it."].join("\n"), {
			docsPath,
			name: "AbiErrorNotFoundError"
		});
	}
};
var AbiErrorSignatureNotFoundError = class extends BaseError {
	constructor(signature, { docsPath, cause }) {
		super([
			`Encoded error signature "${signature}" not found on ABI.`,
			"Make sure you are using the correct ABI and that the error exists on it.",
			`You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${signature}.`
		].join("\n"), {
			docsPath,
			name: "AbiErrorSignatureNotFoundError",
			cause
		});
		Object.defineProperty(this, "signature", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.signature = signature;
	}
};
var AbiEventSignatureEmptyTopicsError = class extends BaseError {
	constructor({ docsPath }) {
		super("Cannot extract event signature from empty topics.", {
			docsPath,
			name: "AbiEventSignatureEmptyTopicsError"
		});
	}
};
var AbiEventSignatureNotFoundError = class extends BaseError {
	constructor(signature, { docsPath }) {
		super([
			`Encoded event signature "${signature}" not found on ABI.`,
			"Make sure you are using the correct ABI and that the event exists on it.",
			`You can look up the signature here: https://4byte.sourcify.dev/?q=${signature}.`
		].join("\n"), {
			docsPath,
			name: "AbiEventSignatureNotFoundError"
		});
	}
};
var AbiEventNotFoundError = class extends BaseError {
	constructor(eventName, { docsPath } = {}) {
		super([`Event ${eventName ? `"${eventName}" ` : ""}not found on ABI.`, "Make sure you are using the correct ABI and that the event exists on it."].join("\n"), {
			docsPath,
			name: "AbiEventNotFoundError"
		});
	}
};
var AbiFunctionNotFoundError = class extends BaseError {
	constructor(functionName, { docsPath } = {}) {
		super([`Function ${functionName ? `"${functionName}" ` : ""}not found on ABI.`, "Make sure you are using the correct ABI and that the function exists on it."].join("\n"), {
			docsPath,
			name: "AbiFunctionNotFoundError"
		});
	}
};
var AbiFunctionOutputsNotFoundError = class extends BaseError {
	constructor(functionName, { docsPath }) {
		super([
			`Function "${functionName}" does not contain any \`outputs\` on ABI.`,
			"Cannot decode function result without knowing what the parameter types are.",
			"Make sure you are using the correct ABI and that the function exists on it."
		].join("\n"), {
			docsPath,
			name: "AbiFunctionOutputsNotFoundError"
		});
	}
};
var AbiFunctionSignatureNotFoundError = class extends BaseError {
	constructor(signature, { docsPath }) {
		super([
			`Encoded function signature "${signature}" not found on ABI.`,
			"Make sure you are using the correct ABI and that the function exists on it.",
			`You can look up the signature here: https://4byte.sourcify.dev/?q=${signature}.`
		].join("\n"), {
			docsPath,
			name: "AbiFunctionSignatureNotFoundError"
		});
	}
};
var AbiItemAmbiguityError = class extends BaseError {
	constructor(x, y) {
		super("Found ambiguous types in overloaded ABI items.", {
			metaMessages: [
				`\`${x.type}\` in \`${formatAbiItem(x.abiItem)}\`, and`,
				`\`${y.type}\` in \`${formatAbiItem(y.abiItem)}\``,
				"",
				"These types encode differently and cannot be distinguished at runtime.",
				"Remove one of the ambiguous items in the ABI."
			],
			name: "AbiItemAmbiguityError"
		});
	}
};
var BytesSizeMismatchError = class extends BaseError {
	constructor({ expectedSize, givenSize }) {
		super(`Expected bytes${expectedSize}, got bytes${givenSize}.`, { name: "BytesSizeMismatchError" });
	}
};
var DecodeLogDataMismatch = class extends BaseError {
	constructor({ abiItem, data, params, size }) {
		super([`Data size of ${size} bytes is too small for non-indexed event parameters.`].join("\n"), {
			metaMessages: [`Params: (${formatAbiParams(params, { includeName: true })})`, `Data:   ${data} (${size} bytes)`],
			name: "DecodeLogDataMismatch"
		});
		Object.defineProperty(this, "abiItem", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "data", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "params", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "size", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.abiItem = abiItem;
		this.data = data;
		this.params = params;
		this.size = size;
	}
};
var DecodeLogTopicsMismatch = class extends BaseError {
	constructor({ abiItem, param }) {
		super([`Expected a topic for indexed event parameter${param.name ? ` "${param.name}"` : ""} on event "${formatAbiItem(abiItem, { includeName: true })}".`].join("\n"), { name: "DecodeLogTopicsMismatch" });
		Object.defineProperty(this, "abiItem", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.abiItem = abiItem;
	}
};
var InvalidAbiEncodingTypeError = class extends BaseError {
	constructor(type, { docsPath }) {
		super([`Type "${type}" is not a valid encoding type.`, "Please provide a valid ABI type."].join("\n"), {
			docsPath,
			name: "InvalidAbiEncodingType"
		});
	}
};
var InvalidAbiDecodingTypeError = class extends BaseError {
	constructor(type, { docsPath }) {
		super([`Type "${type}" is not a valid decoding type.`, "Please provide a valid ABI type."].join("\n"), {
			docsPath,
			name: "InvalidAbiDecodingType"
		});
	}
};
var InvalidArrayError = class extends BaseError {
	constructor(value) {
		super([`Value "${value}" is not a valid array.`].join("\n"), { name: "InvalidArrayError" });
	}
};
var InvalidDefinitionTypeError = class extends BaseError {
	constructor(type) {
		super([`"${type}" is not a valid definition type.`, "Valid types: \"function\", \"event\", \"error\""].join("\n"), { name: "InvalidDefinitionTypeError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/errors/log.js
var FilterTypeNotSupportedError = class extends BaseError {
	constructor(type) {
		super(`Filter type "${type}" is not supported.`, { name: "FilterTypeNotSupportedError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/errors/data.js
var SliceOffsetOutOfBoundsError = class extends BaseError {
	constructor({ offset, position, size }) {
		super(`Slice ${position === "start" ? "starting" : "ending"} at offset "${offset}" is out-of-bounds (size: ${size}).`, { name: "SliceOffsetOutOfBoundsError" });
	}
};
var SizeExceedsPaddingSizeError = class extends BaseError {
	constructor({ size, targetSize, type }) {
		super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (${size}) exceeds padding size (${targetSize}).`, { name: "SizeExceedsPaddingSizeError" });
	}
};
var InvalidBytesLengthError = class extends BaseError {
	constructor({ size, targetSize, type }) {
		super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} is expected to be ${targetSize} ${type} long, but is ${size} ${type} long.`, { name: "InvalidBytesLengthError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/data/pad.js
function pad(hexOrBytes, { dir, size = 32 } = {}) {
	if (typeof hexOrBytes === "string") return padHex(hexOrBytes, {
		dir,
		size
	});
	return padBytes(hexOrBytes, {
		dir,
		size
	});
}
function padHex(hex_, { dir, size = 32 } = {}) {
	if (size === null) return hex_;
	const hex = hex_.replace("0x", "");
	if (hex.length > size * 2) throw new SizeExceedsPaddingSizeError({
		size: Math.ceil(hex.length / 2),
		targetSize: size,
		type: "hex"
	});
	return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size * 2, "0")}`;
}
function padBytes(bytes, { dir, size = 32 } = {}) {
	if (size === null) return bytes;
	if (bytes.length > size) throw new SizeExceedsPaddingSizeError({
		size: bytes.length,
		targetSize: size,
		type: "bytes"
	});
	const paddedBytes = new Uint8Array(size);
	for (let i = 0; i < size; i++) {
		const padEnd = dir === "right";
		paddedBytes[padEnd ? i : size - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
	}
	return paddedBytes;
}
//#endregion
//#region node_modules/viem/_esm/errors/encoding.js
var IntegerOutOfRangeError = class extends BaseError {
	constructor({ max, min, signed, size, value }) {
		super(`Number "${value}" is not in safe ${size ? `${size * 8}-bit ${signed ? "signed" : "unsigned"} ` : ""}integer range ${max ? `(${min} to ${max})` : `(above ${min})`}`, { name: "IntegerOutOfRangeError" });
	}
};
var InvalidBytesBooleanError = class extends BaseError {
	constructor(bytes) {
		super(`Bytes value "${bytes}" is not a valid boolean. The bytes array must contain a single byte of either a 0 or 1 value.`, { name: "InvalidBytesBooleanError" });
	}
};
var InvalidHexBooleanError = class extends BaseError {
	constructor(hex) {
		super(`Hex value "${hex}" is not a valid boolean. The hex value must be "0x0" (false) or "0x1" (true).`, { name: "InvalidHexBooleanError" });
	}
};
var SizeOverflowError = class extends BaseError {
	constructor({ givenSize, maxSize }) {
		super(`Size cannot exceed ${maxSize} bytes. Given size: ${givenSize} bytes.`, { name: "SizeOverflowError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/data/trim.js
function trim(hexOrBytes, { dir = "left" } = {}) {
	let data = typeof hexOrBytes === "string" ? hexOrBytes.replace("0x", "") : hexOrBytes;
	let sliceLength = 0;
	for (let i = 0; i < data.length - 1; i++) if (data[dir === "left" ? i : data.length - i - 1].toString() === "0") sliceLength++;
	else break;
	data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
	if (typeof hexOrBytes === "string") {
		if (data.length === 1 && dir === "right") data = `${data}0`;
		return `0x${data.length % 2 === 1 ? `0${data}` : data}`;
	}
	return data;
}
//#endregion
//#region node_modules/viem/_esm/utils/encoding/fromHex.js
function assertSize(hexOrBytes, { size }) {
	if (size$1(hexOrBytes) > size) throw new SizeOverflowError({
		givenSize: size$1(hexOrBytes),
		maxSize: size
	});
}
/**
* Decodes a hex value into a bigint.
*
* - Docs: https://viem.sh/docs/utilities/fromHex#hextobigint
*
* @param hex Hex value to decode.
* @param opts Options.
* @returns BigInt value.
*
* @example
* import { hexToBigInt } from 'viem'
* const data = hexToBigInt('0x1a4', { signed: true })
* // 420n
*
* @example
* import { hexToBigInt } from 'viem'
* const data = hexToBigInt('0x00000000000000000000000000000000000000000000000000000000000001a4', { size: 32 })
* // 420n
*/
function hexToBigInt(hex, opts = {}) {
	const { signed } = opts;
	if (opts.size) assertSize(hex, { size: opts.size });
	const value = BigInt(hex);
	if (!signed) return value;
	const size = Math.ceil((hex.length - 2) / 2);
	if (value <= (1n << BigInt(size) * 8n - 1n) - 1n) return value;
	return value - BigInt(`0x${"f".padStart(size * 2, "f")}`) - 1n;
}
/**
* Decodes a hex value into a boolean.
*
* - Docs: https://viem.sh/docs/utilities/fromHex#hextobool
*
* @param hex Hex value to decode.
* @param opts Options.
* @returns Boolean value.
*
* @example
* import { hexToBool } from 'viem'
* const data = hexToBool('0x01')
* // true
*
* @example
* import { hexToBool } from 'viem'
* const data = hexToBool('0x0000000000000000000000000000000000000000000000000000000000000001', { size: 32 })
* // true
*/
function hexToBool(hex_, opts = {}) {
	let hex = hex_;
	if (opts.size) {
		assertSize(hex, { size: opts.size });
		hex = trim(hex);
	}
	if (trim(hex) === "0x00") return false;
	if (trim(hex) === "0x01") return true;
	throw new InvalidHexBooleanError(hex);
}
/**
* Decodes a hex string into a number.
*
* - Docs: https://viem.sh/docs/utilities/fromHex#hextonumber
*
* @param hex Hex value to decode.
* @param opts Options.
* @returns Number value.
*
* @example
* import { hexToNumber } from 'viem'
* const data = hexToNumber('0x1a4')
* // 420
*
* @example
* import { hexToNumber } from 'viem'
* const data = hexToNumber('0x00000000000000000000000000000000000000000000000000000000000001a4', { size: 32 })
* // 420
*/
function hexToNumber(hex, opts = {}) {
	const value = hexToBigInt(hex, opts);
	const number = Number(value);
	if (!Number.isSafeInteger(number)) throw new IntegerOutOfRangeError({
		max: `${Number.MAX_SAFE_INTEGER}`,
		min: `${Number.MIN_SAFE_INTEGER}`,
		signed: opts.signed,
		size: opts.size,
		value: `${value}n`
	});
	return number;
}
//#endregion
//#region node_modules/viem/_esm/utils/encoding/toHex.js
var hexes = /*#__PURE__*/ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
/**
* Encodes a string, number, bigint, or ByteArray into a hex string
*
* - Docs: https://viem.sh/docs/utilities/toHex
* - Example: https://viem.sh/docs/utilities/toHex#usage
*
* @param value Value to encode.
* @param opts Options.
* @returns Hex value.
*
* @example
* import { toHex } from 'viem'
* const data = toHex('Hello world')
* // '0x48656c6c6f20776f726c6421'
*
* @example
* import { toHex } from 'viem'
* const data = toHex(420)
* // '0x1a4'
*
* @example
* import { toHex } from 'viem'
* const data = toHex('Hello world', { size: 32 })
* // '0x48656c6c6f20776f726c64210000000000000000000000000000000000000000'
*/
function toHex(value, opts = {}) {
	if (typeof value === "number" || typeof value === "bigint") return numberToHex(value, opts);
	if (typeof value === "string") return stringToHex(value, opts);
	if (typeof value === "boolean") return boolToHex(value, opts);
	return bytesToHex(value, opts);
}
/**
* Encodes a boolean into a hex string
*
* - Docs: https://viem.sh/docs/utilities/toHex#booltohex
*
* @param value Value to encode.
* @param opts Options.
* @returns Hex value.
*
* @example
* import { boolToHex } from 'viem'
* const data = boolToHex(true)
* // '0x1'
*
* @example
* import { boolToHex } from 'viem'
* const data = boolToHex(false)
* // '0x0'
*
* @example
* import { boolToHex } from 'viem'
* const data = boolToHex(true, { size: 32 })
* // '0x0000000000000000000000000000000000000000000000000000000000000001'
*/
function boolToHex(value, opts = {}) {
	const hex = `0x${Number(value)}`;
	if (typeof opts.size === "number") {
		assertSize(hex, { size: opts.size });
		return pad(hex, { size: opts.size });
	}
	return hex;
}
/**
* Encodes a bytes array into a hex string
*
* - Docs: https://viem.sh/docs/utilities/toHex#bytestohex
*
* @param value Value to encode.
* @param opts Options.
* @returns Hex value.
*
* @example
* import { bytesToHex } from 'viem'
* const data = bytesToHex(Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
* // '0x48656c6c6f20576f726c6421'
*
* @example
* import { bytesToHex } from 'viem'
* const data = bytesToHex(Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]), { size: 32 })
* // '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'
*/
function bytesToHex(value, opts = {}) {
	let string = "";
	for (let i = 0; i < value.length; i++) string += hexes[value[i]];
	const hex = `0x${string}`;
	if (typeof opts.size === "number") {
		assertSize(hex, { size: opts.size });
		return pad(hex, {
			dir: "right",
			size: opts.size
		});
	}
	return hex;
}
/**
* Encodes a number or bigint into a hex string
*
* - Docs: https://viem.sh/docs/utilities/toHex#numbertohex
*
* @param value Value to encode.
* @param opts Options.
* @returns Hex value.
*
* @example
* import { numberToHex } from 'viem'
* const data = numberToHex(420)
* // '0x1a4'
*
* @example
* import { numberToHex } from 'viem'
* const data = numberToHex(420, { size: 32 })
* // '0x00000000000000000000000000000000000000000000000000000000000001a4'
*/
function numberToHex(value_, opts = {}) {
	const { signed, size } = opts;
	const value = BigInt(value_);
	let maxValue;
	if (size) {
		if (signed) maxValue = (1n << BigInt(size) * 8n - 1n) - 1n;
		else maxValue = 2n ** (BigInt(size) * 8n) - 1n;
	} else if (typeof value_ === "number") maxValue = BigInt(Number.MAX_SAFE_INTEGER);
	const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
	if (maxValue && value > maxValue || value < minValue) {
		const suffix = typeof value_ === "bigint" ? "n" : "";
		throw new IntegerOutOfRangeError({
			max: maxValue ? `${maxValue}${suffix}` : void 0,
			min: `${minValue}${suffix}`,
			signed,
			size,
			value: `${value_}${suffix}`
		});
	}
	const hex = `0x${(signed && value < 0 ? (1n << BigInt(size * 8)) + BigInt(value) : value).toString(16)}`;
	if (size) return pad(hex, { size });
	return hex;
}
var encoder$1 = /*#__PURE__*/ new TextEncoder();
/**
* Encodes a UTF-8 string into a hex string
*
* - Docs: https://viem.sh/docs/utilities/toHex#stringtohex
*
* @param value Value to encode.
* @param opts Options.
* @returns Hex value.
*
* @example
* import { stringToHex } from 'viem'
* const data = stringToHex('Hello World!')
* // '0x48656c6c6f20576f726c6421'
*
* @example
* import { stringToHex } from 'viem'
* const data = stringToHex('Hello World!', { size: 32 })
* // '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'
*/
function stringToHex(value_, opts = {}) {
	return bytesToHex(encoder$1.encode(value_), opts);
}
//#endregion
//#region node_modules/viem/_esm/utils/encoding/toBytes.js
var encoder = /*#__PURE__*/ new TextEncoder();
/**
* Encodes a UTF-8 string, hex value, bigint, number or boolean to a byte array.
*
* - Docs: https://viem.sh/docs/utilities/toBytes
* - Example: https://viem.sh/docs/utilities/toBytes#usage
*
* @param value Value to encode.
* @param opts Options.
* @returns Byte array value.
*
* @example
* import { toBytes } from 'viem'
* const data = toBytes('Hello world')
* // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
*
* @example
* import { toBytes } from 'viem'
* const data = toBytes(420)
* // Uint8Array([1, 164])
*
* @example
* import { toBytes } from 'viem'
* const data = toBytes(420, { size: 4 })
* // Uint8Array([0, 0, 1, 164])
*/
function toBytes(value, opts = {}) {
	if (typeof value === "number" || typeof value === "bigint") return numberToBytes(value, opts);
	if (typeof value === "boolean") return boolToBytes(value, opts);
	if (isHex(value)) return hexToBytes(value, opts);
	return stringToBytes(value, opts);
}
/**
* Encodes a boolean into a byte array.
*
* - Docs: https://viem.sh/docs/utilities/toBytes#booltobytes
*
* @param value Boolean value to encode.
* @param opts Options.
* @returns Byte array value.
*
* @example
* import { boolToBytes } from 'viem'
* const data = boolToBytes(true)
* // Uint8Array([1])
*
* @example
* import { boolToBytes } from 'viem'
* const data = boolToBytes(true, { size: 32 })
* // Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1])
*/
function boolToBytes(value, opts = {}) {
	const bytes = /* @__PURE__ */ new Uint8Array(1);
	bytes[0] = Number(value);
	if (typeof opts.size === "number") {
		assertSize(bytes, { size: opts.size });
		return pad(bytes, { size: opts.size });
	}
	return bytes;
}
var charCodeMap = {
	zero: 48,
	nine: 57,
	A: 65,
	F: 70,
	a: 97,
	f: 102
};
function charCodeToBase16(char) {
	if (char >= charCodeMap.zero && char <= charCodeMap.nine) return char - charCodeMap.zero;
	if (char >= charCodeMap.A && char <= charCodeMap.F) return char - (charCodeMap.A - 10);
	if (char >= charCodeMap.a && char <= charCodeMap.f) return char - (charCodeMap.a - 10);
}
/**
* Encodes a hex string into a byte array.
*
* - Docs: https://viem.sh/docs/utilities/toBytes#hextobytes
*
* @param hex Hex string to encode.
* @param opts Options.
* @returns Byte array value.
*
* @example
* import { hexToBytes } from 'viem'
* const data = hexToBytes('0x48656c6c6f20776f726c6421')
* // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
*
* @example
* import { hexToBytes } from 'viem'
* const data = hexToBytes('0x48656c6c6f20776f726c6421', { size: 32 })
* // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
*/
function hexToBytes(hex_, opts = {}) {
	let hex = hex_;
	if (opts.size) {
		assertSize(hex, { size: opts.size });
		hex = pad(hex, {
			dir: "right",
			size: opts.size
		});
	}
	let hexString = hex.slice(2);
	if (hexString.length % 2) hexString = `0${hexString}`;
	const length = hexString.length / 2;
	const bytes = new Uint8Array(length);
	for (let index = 0, j = 0; index < length; index++) {
		const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
		const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
		if (nibbleLeft === void 0 || nibbleRight === void 0) throw new BaseError(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
		bytes[index] = nibbleLeft * 16 + nibbleRight;
	}
	return bytes;
}
/**
* Encodes a number into a byte array.
*
* - Docs: https://viem.sh/docs/utilities/toBytes#numbertobytes
*
* @param value Number to encode.
* @param opts Options.
* @returns Byte array value.
*
* @example
* import { numberToBytes } from 'viem'
* const data = numberToBytes(420)
* // Uint8Array([1, 164])
*
* @example
* import { numberToBytes } from 'viem'
* const data = numberToBytes(420, { size: 4 })
* // Uint8Array([0, 0, 1, 164])
*/
function numberToBytes(value, opts) {
	return hexToBytes(numberToHex(value, opts));
}
/**
* Encodes a UTF-8 string into a byte array.
*
* - Docs: https://viem.sh/docs/utilities/toBytes#stringtobytes
*
* @param value String to encode.
* @param opts Options.
* @returns Byte array value.
*
* @example
* import { stringToBytes } from 'viem'
* const data = stringToBytes('Hello world!')
* // Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33])
*
* @example
* import { stringToBytes } from 'viem'
* const data = stringToBytes('Hello world!', { size: 32 })
* // Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
*/
function stringToBytes(value, opts = {}) {
	const bytes = encoder.encode(value);
	if (typeof opts.size === "number") {
		assertSize(bytes, { size: opts.size });
		return pad(bytes, {
			dir: "right",
			size: opts.size
		});
	}
	return bytes;
}
//#endregion
//#region node_modules/viem/_esm/utils/hash/keccak256.js
function keccak256(value, to_) {
	const to = to_ || "hex";
	const bytes = keccak_256(isHex(value, { strict: false }) ? toBytes(value) : value);
	if (to === "bytes") return bytes;
	return toHex(bytes);
}
//#endregion
//#region node_modules/viem/_esm/utils/hash/hashSignature.js
var hash = (value) => keccak256(toBytes(value));
function hashSignature(sig) {
	return hash(sig);
}
//#endregion
//#region node_modules/viem/_esm/utils/hash/normalizeSignature.js
function normalizeSignature(signature) {
	let active = true;
	let current = "";
	let level = 0;
	let result = "";
	let valid = false;
	for (let i = 0; i < signature.length; i++) {
		const char = signature[i];
		if ([
			"(",
			")",
			","
		].includes(char)) active = true;
		if (char === "(") level++;
		if (char === ")") level--;
		if (!active) continue;
		if (level === 0) {
			if (char === " " && [
				"event",
				"function",
				""
			].includes(result)) result = "";
			else {
				result += char;
				if (char === ")") {
					valid = true;
					break;
				}
			}
			continue;
		}
		if (char === " ") {
			if (signature[i - 1] !== "," && current !== "," && current !== ",(") {
				current = "";
				active = false;
			}
			continue;
		}
		result += char;
		current += char;
	}
	if (!valid) throw new BaseError("Unable to normalize signature.");
	return result;
}
//#endregion
//#region node_modules/viem/_esm/utils/hash/toSignature.js
/**
* Returns the signature for a given function or event definition.
*
* @example
* const signature = toSignature('function ownerOf(uint256 tokenId)')
* // 'ownerOf(uint256)'
*
* @example
* const signature_3 = toSignature({
*   name: 'ownerOf',
*   type: 'function',
*   inputs: [{ name: 'tokenId', type: 'uint256' }],
*   outputs: [],
*   stateMutability: 'view',
* })
* // 'ownerOf(uint256)'
*/
var toSignature = (def) => {
	return normalizeSignature((() => {
		if (typeof def === "string") return def;
		return formatAbiItem$1(def);
	})());
};
//#endregion
//#region node_modules/viem/_esm/utils/hash/toSignatureHash.js
/**
* Returns the hash (of the function/event signature) for a given event or function definition.
*/
function toSignatureHash(fn) {
	return hashSignature(toSignature(fn));
}
//#endregion
//#region node_modules/viem/_esm/utils/hash/toEventSelector.js
/**
* Returns the event selector for a given event definition.
*
* @example
* const selector = toEventSelector('Transfer(address indexed from, address indexed to, uint256 amount)')
* // 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
*/
var toEventSelector = toSignatureHash;
//#endregion
//#region node_modules/viem/_esm/errors/address.js
var InvalidAddressError = class extends BaseError {
	constructor({ address }) {
		super(`Address "${address}" is invalid.`, {
			metaMessages: ["- Address must be a hex value of 20 bytes (40 hex characters).", "- Address must match its checksum counterpart."],
			name: "InvalidAddressError"
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/lru.js
/**
* Map with a LRU (Least recently used) policy.
*
* @link https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU
*/
var LruMap = class extends Map {
	constructor(size) {
		super();
		Object.defineProperty(this, "maxSize", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.maxSize = size;
	}
	get(key) {
		const value = super.get(key);
		if (super.has(key)) {
			super.delete(key);
			super.set(key, value);
		}
		return value;
	}
	set(key, value) {
		if (super.has(key)) super.delete(key);
		super.set(key, value);
		if (this.maxSize && this.size > this.maxSize) {
			const firstKey = super.keys().next().value;
			if (firstKey !== void 0) super.delete(firstKey);
		}
		return this;
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/address/getAddress.js
var checksumAddressCache = /*#__PURE__*/ new LruMap(8192);
function checksumAddress(address_, chainId) {
	if (checksumAddressCache.has(`${address_}.${chainId}`)) return checksumAddressCache.get(`${address_}.${chainId}`);
	const hexAddress = chainId ? `${chainId}${address_.toLowerCase()}` : address_.substring(2).toLowerCase();
	const hash = keccak256(stringToBytes(hexAddress), "bytes");
	const address = (chainId ? hexAddress.substring(`${chainId}0x`.length) : hexAddress).split("");
	for (let i = 0; i < 40; i += 2) {
		if (hash[i >> 1] >> 4 >= 8 && address[i]) address[i] = address[i].toUpperCase();
		if ((hash[i >> 1] & 15) >= 8 && address[i + 1]) address[i + 1] = address[i + 1].toUpperCase();
	}
	const result = `0x${address.join("")}`;
	checksumAddressCache.set(`${address_}.${chainId}`, result);
	return result;
}
function getAddress(address, chainId) {
	if (!isAddress(address, { strict: false })) throw new InvalidAddressError({ address });
	return checksumAddress(address, chainId);
}
//#endregion
//#region node_modules/viem/_esm/utils/address/isAddress.js
var addressRegex = /^0x[a-fA-F0-9]{40}$/;
/** @internal */
var isAddressCache = /*#__PURE__*/ new LruMap(8192);
function isAddress(address, options) {
	const { strict = true } = options ?? {};
	const cacheKey = `${address}.${strict}`;
	if (isAddressCache.has(cacheKey)) return isAddressCache.get(cacheKey);
	const result = (() => {
		if (!addressRegex.test(address)) return false;
		if (address.toLowerCase() === address) return true;
		if (strict) return checksumAddress(address) === address;
		return true;
	})();
	isAddressCache.set(cacheKey, result);
	return result;
}
//#endregion
//#region node_modules/viem/_esm/utils/data/concat.js
function concat(values) {
	if (typeof values[0] === "string") return concatHex(values);
	return concatBytes(values);
}
function concatBytes(values) {
	let length = 0;
	for (const arr of values) length += arr.length;
	const result = new Uint8Array(length);
	let offset = 0;
	for (const arr of values) {
		result.set(arr, offset);
		offset += arr.length;
	}
	return result;
}
function concatHex(values) {
	return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
//#endregion
//#region node_modules/viem/_esm/utils/data/slice.js
/**
* @description Returns a section of the hex or byte array given a start/end bytes offset.
*
* @param value The hex or byte array to slice.
* @param start The start offset (in bytes).
* @param end The end offset (in bytes).
*/
function slice(value, start, end, { strict } = {}) {
	if (isHex(value, { strict: false })) return sliceHex(value, start, end, { strict });
	return sliceBytes(value, start, end, { strict });
}
function assertStartOffset(value, start) {
	if (typeof start === "number" && start > 0 && start > size$1(value) - 1) throw new SliceOffsetOutOfBoundsError({
		offset: start,
		position: "start",
		size: size$1(value)
	});
}
function assertEndOffset(value, start, end) {
	if (typeof start === "number" && typeof end === "number" && size$1(value) !== end - start) throw new SliceOffsetOutOfBoundsError({
		offset: end,
		position: "end",
		size: size$1(value)
	});
}
/**
* @description Returns a section of the byte array given a start/end bytes offset.
*
* @param value The byte array to slice.
* @param start The start offset (in bytes).
* @param end The end offset (in bytes).
*/
function sliceBytes(value_, start, end, { strict } = {}) {
	assertStartOffset(value_, start);
	const value = value_.slice(start, end);
	if (strict) assertEndOffset(value, start, end);
	return value;
}
/**
* @description Returns a section of the hex value given a start/end bytes offset.
*
* @param value The hex value to slice.
* @param start The start offset (in bytes).
* @param end The end offset (in bytes).
*/
function sliceHex(value_, start, end, { strict } = {}) {
	assertStartOffset(value_, start);
	const value = `0x${value_.replace("0x", "").slice((start ?? 0) * 2, (end ?? value_.length) * 2)}`;
	if (strict) assertEndOffset(value, start, end);
	return value;
}
//#endregion
//#region node_modules/viem/_esm/utils/regex.js
var bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
var integerRegex = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
//#endregion
//#region node_modules/viem/_esm/utils/abi/encodeAbiParameters.js
/**
* @description Encodes a list of primitive values into an ABI-encoded hex value.
*
* - Docs: https://viem.sh/docs/abi/encodeAbiParameters#encodeabiparameters
*
*   Generates ABI encoded data using the [ABI specification](https://docs.soliditylang.org/en/latest/abi-spec), given a set of ABI parameters (inputs/outputs) and their corresponding values.
*
* @param params - a set of ABI Parameters (params), that can be in the shape of the inputs or outputs attribute of an ABI Item.
* @param values - a set of values (values) that correspond to the given params.
* @example
* ```typescript
* import { encodeAbiParameters } from 'viem'
*
* const encodedData = encodeAbiParameters(
*   [
*     { name: 'x', type: 'string' },
*     { name: 'y', type: 'uint' },
*     { name: 'z', type: 'bool' }
*   ],
*   ['wagmi', 420n, true]
* )
* ```
*
* You can also pass in Human Readable parameters with the parseAbiParameters utility.
*
* @example
* ```typescript
* import { encodeAbiParameters, parseAbiParameters } from 'viem'
*
* const encodedData = encodeAbiParameters(
*   parseAbiParameters('string x, uint y, bool z'),
*   ['wagmi', 420n, true]
* )
* ```
*/
function encodeAbiParameters(params, values) {
	if (params.length !== values.length) throw new AbiEncodingLengthMismatchError({
		expectedLength: params.length,
		givenLength: values.length
	});
	return encodeParams(prepareParams({
		params,
		values
	}));
}
function prepareParams({ params, values }) {
	const preparedParams = [];
	for (let i = 0; i < params.length; i++) preparedParams.push(prepareParam({
		param: params[i],
		value: values[i]
	}));
	return preparedParams;
}
function prepareParam({ param, value }) {
	const arrayComponents = getArrayComponents(param.type);
	if (arrayComponents) {
		const [length, type] = arrayComponents;
		return encodeArray(value, {
			length,
			param: {
				...param,
				type
			}
		});
	}
	if (param.type === "tuple") return encodeTuple(value, { param });
	if (param.type === "address") return encodeAddress(value);
	if (param.type === "bool") return encodeBool(value);
	if (param.type.startsWith("uint") || param.type.startsWith("int")) {
		const signed = param.type.startsWith("int");
		const [, , size = "256"] = integerRegex.exec(param.type) ?? [];
		return encodeNumber(value, {
			signed,
			size: Number(size)
		});
	}
	if (param.type.startsWith("bytes")) return encodeBytes(value, { param });
	if (param.type === "string") return encodeString(value);
	throw new InvalidAbiEncodingTypeError(param.type, { docsPath: "/docs/contract/encodeAbiParameters" });
}
function encodeParams(preparedParams) {
	let staticSize = 0;
	for (let i = 0; i < preparedParams.length; i++) {
		const { dynamic, encoded } = preparedParams[i];
		if (dynamic) staticSize += 32;
		else staticSize += size$1(encoded);
	}
	const staticParams = [];
	const dynamicParams = [];
	let dynamicSize = 0;
	for (let i = 0; i < preparedParams.length; i++) {
		const { dynamic, encoded } = preparedParams[i];
		if (dynamic) {
			staticParams.push(numberToHex(staticSize + dynamicSize, { size: 32 }));
			dynamicParams.push(encoded);
			dynamicSize += size$1(encoded);
		} else staticParams.push(encoded);
	}
	return concatHex([...staticParams, ...dynamicParams]);
}
function encodeAddress(value) {
	if (!isAddress(value)) throw new InvalidAddressError({ address: value });
	return {
		dynamic: false,
		encoded: padHex(value.toLowerCase())
	};
}
function encodeArray(value, { length, param }) {
	const dynamic = length === null;
	if (!Array.isArray(value)) throw new InvalidArrayError(value);
	if (!dynamic && value.length !== length) throw new AbiEncodingArrayLengthMismatchError({
		expectedLength: length,
		givenLength: value.length,
		type: `${param.type}[${length}]`
	});
	let dynamicChild = value.length === 0 && isDynamicType(param);
	const preparedParams = [];
	for (let i = 0; i < value.length; i++) {
		const preparedParam = prepareParam({
			param,
			value: value[i]
		});
		if (preparedParam.dynamic) dynamicChild = true;
		preparedParams.push(preparedParam);
	}
	if (dynamic || dynamicChild) {
		const data = encodeParams(preparedParams);
		if (dynamic) return {
			dynamic: true,
			encoded: concatHex([numberToHex(preparedParams.length, { size: 32 }), data])
		};
		if (dynamicChild) return {
			dynamic: true,
			encoded: data
		};
	}
	return {
		dynamic: false,
		encoded: concatHex(preparedParams.map(({ encoded }) => encoded))
	};
}
function encodeBytes(value, { param }) {
	const [, paramSize] = param.type.split("bytes");
	const bytesSize = size$1(value);
	if (!paramSize) {
		let value_ = value;
		if (bytesSize % 32 !== 0) value_ = padHex(value_, {
			dir: "right",
			size: Math.ceil((value.length - 2) / 2 / 32) * 32
		});
		return {
			dynamic: true,
			encoded: concatHex([padHex(numberToHex(bytesSize, { size: 32 })), value_])
		};
	}
	if (bytesSize !== Number.parseInt(paramSize, 10)) throw new AbiEncodingBytesSizeMismatchError({
		expectedSize: Number.parseInt(paramSize, 10),
		value
	});
	return {
		dynamic: false,
		encoded: padHex(value, { dir: "right" })
	};
}
function encodeBool(value) {
	if (typeof value !== "boolean") throw new BaseError(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
	return {
		dynamic: false,
		encoded: padHex(boolToHex(value))
	};
}
function encodeNumber(value, { signed, size = 256 }) {
	if (typeof size === "number") {
		const max = 2n ** (BigInt(size) - (signed ? 1n : 0n)) - 1n;
		const min = signed ? -max - 1n : 0n;
		if (value > max || value < min) throw new IntegerOutOfRangeError({
			max: max.toString(),
			min: min.toString(),
			signed,
			size: size / 8,
			value: value.toString()
		});
	}
	return {
		dynamic: false,
		encoded: numberToHex(value, {
			size: 32,
			signed
		})
	};
}
function encodeString(value) {
	const hexValue = stringToHex(value);
	const partsLength = Math.ceil(size$1(hexValue) / 32);
	const parts = [];
	for (let i = 0; i < partsLength; i++) parts.push(padHex(slice(hexValue, i * 32, (i + 1) * 32), { dir: "right" }));
	return {
		dynamic: true,
		encoded: concatHex([padHex(numberToHex(size$1(hexValue), { size: 32 })), ...parts])
	};
}
function encodeTuple(value, { param }) {
	let dynamic = false;
	const preparedParams = [];
	for (let i = 0; i < param.components.length; i++) {
		const param_ = param.components[i];
		const preparedParam = prepareParam({
			param: param_,
			value: value[Array.isArray(value) ? i : param_.name]
		});
		preparedParams.push(preparedParam);
		if (preparedParam.dynamic) dynamic = true;
	}
	return {
		dynamic,
		encoded: dynamic ? encodeParams(preparedParams) : concatHex(preparedParams.map(({ encoded }) => encoded))
	};
}
function getArrayComponents(type) {
	const matches = type.match(/^(.*)\[(\d+)?\]$/);
	return matches ? [matches[2] ? Number(matches[2]) : null, matches[1]] : void 0;
}
function isDynamicType(param) {
	const { type } = param;
	if (type === "string") return true;
	if (type === "bytes") return true;
	if (type.endsWith("[]")) return true;
	if (type === "tuple") return param.components.some(isDynamicType);
	const arrayComponents = getArrayComponents(type);
	if (arrayComponents) return isDynamicType({
		...param,
		type: arrayComponents[1]
	});
	return false;
}
//#endregion
//#region node_modules/viem/_esm/utils/hash/toFunctionSelector.js
/**
* Returns the function selector for a given function definition.
*
* @example
* const selector = toFunctionSelector('function ownerOf(uint256 tokenId)')
* // 0x6352211e
*/
var toFunctionSelector = (fn) => slice(toSignatureHash(fn), 0, 4);
//#endregion
//#region node_modules/viem/_esm/utils/abi/getAbiItem.js
function getAbiItem(parameters) {
	const { abi, args = [], name } = parameters;
	const isSelector = isHex(name, { strict: false });
	const abiItems = abi.filter((abiItem) => {
		if (isSelector) {
			if (abiItem.type === "function") return toFunctionSelector(abiItem) === name;
			if (abiItem.type === "event") return toEventSelector(abiItem) === name;
			return false;
		}
		return "name" in abiItem && abiItem.name === name;
	});
	if (abiItems.length === 0) return void 0;
	if (abiItems.length === 1) return abiItems[0];
	let matchedAbiItem;
	for (const abiItem of abiItems) {
		if (!("inputs" in abiItem)) continue;
		if (!args || args.length === 0) {
			if (!abiItem.inputs || abiItem.inputs.length === 0) return abiItem;
			continue;
		}
		if (!abiItem.inputs) continue;
		if (abiItem.inputs.length === 0) continue;
		if (abiItem.inputs.length !== args.length) continue;
		if (args.every((arg, index) => {
			const abiParameter = "inputs" in abiItem && abiItem.inputs[index];
			if (!abiParameter) return false;
			return isArgOfType(arg, abiParameter);
		})) {
			if (matchedAbiItem && "inputs" in matchedAbiItem && matchedAbiItem.inputs) {
				const ambiguousTypes = getAmbiguousTypes(abiItem.inputs, matchedAbiItem.inputs, args);
				if (ambiguousTypes) throw new AbiItemAmbiguityError({
					abiItem,
					type: ambiguousTypes[0]
				}, {
					abiItem: matchedAbiItem,
					type: ambiguousTypes[1]
				});
			}
			matchedAbiItem = abiItem;
		}
	}
	if (matchedAbiItem) return matchedAbiItem;
	return abiItems[0];
}
/** @internal */
function isArgOfType(arg, abiParameter) {
	const argType = typeof arg;
	const abiParameterType = abiParameter.type;
	switch (abiParameterType) {
		case "address": return isAddress(arg, { strict: false });
		case "bool": return argType === "boolean";
		case "function": return argType === "string";
		case "string": return argType === "string";
		default:
			if (abiParameterType === "tuple" && "components" in abiParameter) return Object.values(abiParameter.components).every((component, index) => {
				return argType === "object" && isArgOfType(Object.values(arg)[index], component);
			});
			if (/^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/.test(abiParameterType)) return argType === "number" || argType === "bigint";
			if (/^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/.test(abiParameterType)) return argType === "string" || arg instanceof Uint8Array;
			if (/[a-z]+[1-9]{0,3}(\[[0-9]{0,}\])+$/.test(abiParameterType)) return Array.isArray(arg) && arg.every((x) => isArgOfType(x, {
				...abiParameter,
				type: abiParameterType.replace(/(\[[0-9]{0,}\])$/, "")
			}));
			return false;
	}
}
/** @internal */
function getAmbiguousTypes(sourceParameters, targetParameters, args) {
	for (const parameterIndex in sourceParameters) {
		const sourceParameter = sourceParameters[parameterIndex];
		const targetParameter = targetParameters[parameterIndex];
		if (sourceParameter.type === "tuple" && targetParameter.type === "tuple" && "components" in sourceParameter && "components" in targetParameter) return getAmbiguousTypes(sourceParameter.components, targetParameter.components, args[parameterIndex]);
		const types = [sourceParameter.type, targetParameter.type];
		if ((() => {
			if (types.includes("address") && types.includes("bytes20")) return true;
			if (types.includes("address") && types.includes("string")) return isAddress(args[parameterIndex], { strict: false });
			if (types.includes("address") && types.includes("bytes")) return isAddress(args[parameterIndex], { strict: false });
			return false;
		})()) return types;
	}
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/encodeEventTopics.js
var docsPath$6 = "/docs/contract/encodeEventTopics";
function encodeEventTopics(parameters) {
	const { abi, eventName, args } = parameters;
	let abiItem = abi[0];
	if (eventName) {
		const item = getAbiItem({
			abi,
			name: eventName
		});
		if (!item) throw new AbiEventNotFoundError(eventName, { docsPath: docsPath$6 });
		abiItem = item;
	}
	if (abiItem.type !== "event") throw new AbiEventNotFoundError(void 0, { docsPath: docsPath$6 });
	let topics = [];
	if (args && "inputs" in abiItem) {
		const indexedInputs = abiItem.inputs?.filter((param) => "indexed" in param && param.indexed);
		const args_ = Array.isArray(args) ? args : Object.values(args).length > 0 ? indexedInputs?.map((x) => args[x.name]) ?? [] : [];
		if (args_.length > 0) topics = indexedInputs?.map((param, i) => {
			if (Array.isArray(args_[i])) return args_[i].map((_, j) => encodeArg({
				param,
				value: args_[i][j]
			}));
			return typeof args_[i] !== "undefined" && args_[i] !== null ? encodeArg({
				param,
				value: args_[i]
			}) : null;
		}) ?? [];
	}
	if (abiItem.anonymous) return topics;
	return [toEventSelector(formatAbiItem(abiItem)), ...topics];
}
function encodeArg({ param, value }) {
	if (param.type === "string" || param.type === "bytes") return keccak256(toBytes(value));
	if (param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/)) throw new FilterTypeNotSupportedError(param.type);
	return encodeAbiParameters([param], [value]);
}
//#endregion
//#region node_modules/viem/_esm/utils/filters/createFilterRequestScope.js
/**
* Scopes `request` to the filter ID. If the client is a fallback, it will
* listen for responses and scope the child transport `request` function
* to the successful filter ID.
*/
function createFilterRequestScope(client, { method }) {
	const requestMap = {};
	if (client.transport.type === "fallback") client.transport.onResponse?.(({ method: method_, response: id, status, transport }) => {
		if (status === "success" && method === method_) requestMap[id] = transport.request;
	});
	return ((id) => requestMap[id] || client.request);
}
//#endregion
//#region node_modules/viem/_esm/actions/public/createContractEventFilter.js
/**
* Creates a Filter to retrieve event logs that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges) or [`getFilterLogs`](https://viem.sh/docs/actions/public/getFilterLogs).
*
* - Docs: https://viem.sh/docs/contract/createContractEventFilter
*
* @param client - Client to use
* @param parameters - {@link CreateContractEventFilterParameters}
* @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateContractEventFilterReturnType}
*
* @example
* import { createPublicClient, http, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createContractEventFilter } from 'viem/contract'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createContractEventFilter(client, {
*   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
* })
*/
async function createContractEventFilter(client, parameters) {
	const { address, abi, args, eventName, fromBlock, strict, toBlock } = parameters;
	const getRequest = createFilterRequestScope(client, { method: "eth_newFilter" });
	const topics = eventName ? encodeEventTopics({
		abi,
		args,
		eventName
	}) : void 0;
	const id = await client.request({
		method: "eth_newFilter",
		params: [{
			address,
			fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
			toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
			topics
		}]
	});
	return {
		abi,
		args,
		eventName,
		id,
		request: getRequest(id),
		strict: Boolean(strict),
		type: "event"
	};
}
//#endregion
//#region node_modules/viem/_esm/accounts/utils/parseAccount.js
function parseAccount(account) {
	if (typeof account === "string") return {
		address: account,
		type: "json-rpc"
	};
	return account;
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/prepareEncodeFunctionData.js
var docsPath$5 = "/docs/contract/encodeFunctionData";
function prepareEncodeFunctionData(parameters) {
	const { abi, args, functionName } = parameters;
	let abiItem = abi[0];
	if (functionName) {
		const item = getAbiItem({
			abi,
			args,
			name: functionName
		});
		if (!item) throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath$5 });
		abiItem = item;
	}
	if (abiItem.type !== "function") throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath$5 });
	return {
		abi: [abiItem],
		functionName: toFunctionSelector(formatAbiItem(abiItem))
	};
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/encodeFunctionData.js
function encodeFunctionData(parameters) {
	const { args } = parameters;
	const { abi, functionName } = (() => {
		if (parameters.abi.length === 1 && parameters.functionName?.startsWith("0x")) return parameters;
		return prepareEncodeFunctionData(parameters);
	})();
	const abiItem = abi[0];
	return concatHex([functionName, ("inputs" in abiItem && abiItem.inputs ? encodeAbiParameters(abiItem.inputs, args ?? []) : void 0) ?? "0x"]);
}
//#endregion
//#region node_modules/viem/_esm/constants/solidity.js
var panicReasons = {
	1: "An `assert` condition failed.",
	17: "Arithmetic operation resulted in underflow or overflow.",
	18: "Division or modulo by zero (e.g. `5 / 0` or `23 % 0`).",
	33: "Attempted to convert to an invalid type.",
	34: "Attempted to access a storage byte array that is incorrectly encoded.",
	49: "Performed `.pop()` on an empty array",
	50: "Array index is out of bounds.",
	65: "Allocated too much memory or created an array which is too large.",
	81: "Attempted to call a zero-initialized variable of internal function type."
};
var solidityError = {
	inputs: [{
		name: "message",
		type: "string"
	}],
	name: "Error",
	type: "error"
};
var solidityPanic = {
	inputs: [{
		name: "reason",
		type: "uint256"
	}],
	name: "Panic",
	type: "error"
};
//#endregion
//#region node_modules/viem/_esm/errors/cursor.js
var NegativeOffsetError = class extends BaseError {
	constructor({ offset }) {
		super(`Offset \`${offset}\` cannot be negative.`, { name: "NegativeOffsetError" });
	}
};
var PositionOutOfBoundsError = class extends BaseError {
	constructor({ length, position }) {
		super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`, { name: "PositionOutOfBoundsError" });
	}
};
var RecursiveReadLimitExceededError = class extends BaseError {
	constructor({ count, limit }) {
		super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`, { name: "RecursiveReadLimitExceededError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/cursor.js
var staticCursor = {
	bytes: /* @__PURE__ */ new Uint8Array(),
	dataView: /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(0)),
	position: 0,
	positionReadCount: /* @__PURE__ */ new Map(),
	recursiveReadCount: 0,
	recursiveReadLimit: Number.POSITIVE_INFINITY,
	assertReadLimit() {
		if (this.recursiveReadCount >= this.recursiveReadLimit) throw new RecursiveReadLimitExceededError({
			count: this.recursiveReadCount + 1,
			limit: this.recursiveReadLimit
		});
	},
	assertPosition(position) {
		if (position < 0 || position > this.bytes.length - 1) throw new PositionOutOfBoundsError({
			length: this.bytes.length,
			position
		});
	},
	decrementPosition(offset) {
		if (offset < 0) throw new NegativeOffsetError({ offset });
		const position = this.position - offset;
		this.assertPosition(position);
		this.position = position;
	},
	getReadCount(position) {
		return this.positionReadCount.get(position || this.position) || 0;
	},
	incrementPosition(offset) {
		if (offset < 0) throw new NegativeOffsetError({ offset });
		const position = this.position + offset;
		this.assertPosition(position);
		this.position = position;
	},
	inspectByte(position_) {
		const position = position_ ?? this.position;
		this.assertPosition(position);
		return this.bytes[position];
	},
	inspectBytes(length, position_) {
		const position = position_ ?? this.position;
		this.assertPosition(position + length - 1);
		return this.bytes.subarray(position, position + length);
	},
	inspectUint8(position_) {
		const position = position_ ?? this.position;
		this.assertPosition(position);
		return this.bytes[position];
	},
	inspectUint16(position_) {
		const position = position_ ?? this.position;
		this.assertPosition(position + 1);
		return this.dataView.getUint16(position);
	},
	inspectUint24(position_) {
		const position = position_ ?? this.position;
		this.assertPosition(position + 2);
		return (this.dataView.getUint16(position) << 8) + this.dataView.getUint8(position + 2);
	},
	inspectUint32(position_) {
		const position = position_ ?? this.position;
		this.assertPosition(position + 3);
		return this.dataView.getUint32(position);
	},
	pushByte(byte) {
		this.assertPosition(this.position);
		this.bytes[this.position] = byte;
		this.position++;
	},
	pushBytes(bytes) {
		this.assertPosition(this.position + bytes.length - 1);
		this.bytes.set(bytes, this.position);
		this.position += bytes.length;
	},
	pushUint8(value) {
		this.assertPosition(this.position);
		this.bytes[this.position] = value;
		this.position++;
	},
	pushUint16(value) {
		this.assertPosition(this.position + 1);
		this.dataView.setUint16(this.position, value);
		this.position += 2;
	},
	pushUint24(value) {
		this.assertPosition(this.position + 2);
		this.dataView.setUint16(this.position, value >> 8);
		this.dataView.setUint8(this.position + 2, value & 255);
		this.position += 3;
	},
	pushUint32(value) {
		this.assertPosition(this.position + 3);
		this.dataView.setUint32(this.position, value);
		this.position += 4;
	},
	readByte() {
		this.assertReadLimit();
		this._touch();
		const value = this.inspectByte();
		this.position++;
		return value;
	},
	readBytes(length, size) {
		this.assertReadLimit();
		this._touch();
		const value = this.inspectBytes(length);
		this.position += size ?? length;
		return value;
	},
	readUint8() {
		this.assertReadLimit();
		this._touch();
		const value = this.inspectUint8();
		this.position += 1;
		return value;
	},
	readUint16() {
		this.assertReadLimit();
		this._touch();
		const value = this.inspectUint16();
		this.position += 2;
		return value;
	},
	readUint24() {
		this.assertReadLimit();
		this._touch();
		const value = this.inspectUint24();
		this.position += 3;
		return value;
	},
	readUint32() {
		this.assertReadLimit();
		this._touch();
		const value = this.inspectUint32();
		this.position += 4;
		return value;
	},
	get remaining() {
		return this.bytes.length - this.position;
	},
	setPosition(position) {
		const oldPosition = this.position;
		this.assertPosition(position);
		this.position = position;
		return () => this.position = oldPosition;
	},
	_touch() {
		if (this.recursiveReadLimit === Number.POSITIVE_INFINITY) return;
		const count = this.getReadCount();
		this.positionReadCount.set(this.position, count + 1);
		if (count > 0) this.recursiveReadCount++;
	}
};
function createCursor(bytes, { recursiveReadLimit = 8192 } = {}) {
	const cursor = Object.create(staticCursor);
	cursor.bytes = bytes;
	cursor.dataView = new DataView(bytes.buffer ?? bytes, bytes.byteOffset, bytes.byteLength);
	cursor.positionReadCount = /* @__PURE__ */ new Map();
	cursor.recursiveReadLimit = recursiveReadLimit;
	return cursor;
}
//#endregion
//#region node_modules/viem/_esm/utils/encoding/fromBytes.js
/**
* Decodes a byte array into a bigint.
*
* - Docs: https://viem.sh/docs/utilities/fromBytes#bytestobigint
*
* @param bytes Byte array to decode.
* @param opts Options.
* @returns BigInt value.
*
* @example
* import { bytesToBigInt } from 'viem'
* const data = bytesToBigInt(new Uint8Array([1, 164]))
* // 420n
*/
function bytesToBigInt(bytes, opts = {}) {
	if (typeof opts.size !== "undefined") assertSize(bytes, { size: opts.size });
	return hexToBigInt(bytesToHex(bytes), opts);
}
/**
* Decodes a byte array into a boolean.
*
* - Docs: https://viem.sh/docs/utilities/fromBytes#bytestobool
*
* @param bytes Byte array to decode.
* @param opts Options.
* @returns Boolean value.
*
* @example
* import { bytesToBool } from 'viem'
* const data = bytesToBool(new Uint8Array([1]))
* // true
*/
function bytesToBool(bytes_, opts = {}) {
	let bytes = bytes_;
	if (typeof opts.size !== "undefined") {
		assertSize(bytes, { size: opts.size });
		bytes = trim(bytes);
	}
	if (bytes.length > 1 || bytes[0] > 1) throw new InvalidBytesBooleanError(bytes);
	return Boolean(bytes[0]);
}
/**
* Decodes a byte array into a number.
*
* - Docs: https://viem.sh/docs/utilities/fromBytes#bytestonumber
*
* @param bytes Byte array to decode.
* @param opts Options.
* @returns Number value.
*
* @example
* import { bytesToNumber } from 'viem'
* const data = bytesToNumber(new Uint8Array([1, 164]))
* // 420
*/
function bytesToNumber(bytes, opts = {}) {
	if (typeof opts.size !== "undefined") assertSize(bytes, { size: opts.size });
	return hexToNumber(bytesToHex(bytes), opts);
}
/**
* Decodes a byte array into a UTF-8 string.
*
* - Docs: https://viem.sh/docs/utilities/fromBytes#bytestostring
*
* @param bytes Byte array to decode.
* @param opts Options.
* @returns String value.
*
* @example
* import { bytesToString } from 'viem'
* const data = bytesToString(new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]))
* // 'Hello world'
*/
function bytesToString(bytes_, opts = {}) {
	let bytes = bytes_;
	if (typeof opts.size !== "undefined") {
		assertSize(bytes, { size: opts.size });
		bytes = trim(bytes, { dir: "right" });
	}
	return new TextDecoder().decode(bytes);
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/decodeAbiParameters.js
function decodeAbiParameters(params, data) {
	const bytes = typeof data === "string" ? hexToBytes(data) : data;
	const cursor = createCursor(bytes);
	if (size$1(bytes) === 0 && params.length > 0) throw new AbiDecodingZeroDataError();
	if (size$1(data) && size$1(data) < 32) throw new AbiDecodingDataSizeTooSmallError({
		data: typeof data === "string" ? data : bytesToHex(data),
		params,
		size: size$1(data)
	});
	let consumed = 0;
	const values = [];
	for (let i = 0; i < params.length; ++i) {
		const param = params[i];
		if (consumed < bytes.length) cursor.setPosition(consumed);
		const [data, consumed_] = decodeParameter(cursor, param, { staticPosition: 0 });
		consumed += consumed_;
		values.push(data);
	}
	return values;
}
function decodeParameter(cursor, param, { staticPosition }) {
	const arrayComponents = getArrayComponents(param.type);
	if (arrayComponents) {
		const [length, type] = arrayComponents;
		return decodeArray(cursor, {
			...param,
			type
		}, {
			length,
			staticPosition
		});
	}
	if (param.type === "tuple") return decodeTuple(cursor, param, { staticPosition });
	if (param.type === "address") return decodeAddress$1(cursor);
	if (param.type === "bool") return decodeBool(cursor);
	if (param.type.startsWith("bytes")) return decodeBytes(cursor, param, { staticPosition });
	if (param.type.startsWith("uint") || param.type.startsWith("int")) return decodeNumber(cursor, param);
	if (param.type === "string") return decodeString(cursor, { staticPosition });
	throw new InvalidAbiDecodingTypeError(param.type, { docsPath: "/docs/contract/decodeAbiParameters" });
}
var sizeOfLength = 32;
var sizeOfOffset = 32;
function decodeAddress$1(cursor) {
	return [checksumAddress(bytesToHex(sliceBytes(cursor.readBytes(32), -20))), 32];
}
function decodeArray(cursor, param, { length, staticPosition }) {
	if (length === null) {
		const start = staticPosition + bytesToNumber(cursor.readBytes(sizeOfOffset));
		const startOfData = start + sizeOfLength;
		cursor.setPosition(start);
		const length = bytesToNumber(cursor.readBytes(sizeOfLength));
		const dynamicChild = hasDynamicChild(param);
		let consumed = 0;
		const value = [];
		for (let i = 0; i < length; ++i) {
			cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed));
			const [data, consumed_] = decodeParameter(cursor, param, { staticPosition: startOfData });
			consumed += consumed_;
			value.push(data);
			if (consumed_ === 0) {
				cursor.assertReadLimit();
				cursor._touch();
			}
		}
		cursor.setPosition(staticPosition + 32);
		return [value, 32];
	}
	if (hasDynamicChild(param)) {
		const start = staticPosition + bytesToNumber(cursor.readBytes(sizeOfOffset));
		const value = [];
		for (let i = 0; i < length; ++i) {
			cursor.setPosition(start + i * 32);
			const [data] = decodeParameter(cursor, param, { staticPosition: start });
			value.push(data);
		}
		cursor.setPosition(staticPosition + 32);
		return [value, 32];
	}
	let consumed = 0;
	const value = [];
	for (let i = 0; i < length; ++i) {
		const [data, consumed_] = decodeParameter(cursor, param, { staticPosition: staticPosition + consumed });
		consumed += consumed_;
		value.push(data);
		if (consumed_ === 0) {
			cursor.assertReadLimit();
			cursor._touch();
		}
	}
	return [value, consumed];
}
function decodeBool(cursor) {
	return [bytesToBool(cursor.readBytes(32), { size: 32 }), 32];
}
function decodeBytes(cursor, param, { staticPosition }) {
	const [_, size] = param.type.split("bytes");
	if (!size) {
		const offset = bytesToNumber(cursor.readBytes(32));
		cursor.setPosition(staticPosition + offset);
		const length = bytesToNumber(cursor.readBytes(32));
		if (length === 0) {
			cursor.setPosition(staticPosition + 32);
			return ["0x", 32];
		}
		const data = cursor.readBytes(length);
		cursor.setPosition(staticPosition + 32);
		return [bytesToHex(data), 32];
	}
	return [bytesToHex(cursor.readBytes(Number.parseInt(size, 10), 32)), 32];
}
function decodeNumber(cursor, param) {
	const signed = param.type.startsWith("int");
	const size = Number.parseInt(param.type.split("int")[1] || "256", 10);
	const value = cursor.readBytes(32);
	return [size > 48 ? bytesToBigInt(value, { signed }) : bytesToNumber(value, { signed }), 32];
}
function decodeTuple(cursor, param, { staticPosition }) {
	const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
	const value = hasUnnamedChild ? [] : {};
	let consumed = 0;
	if (hasDynamicChild(param)) {
		const start = staticPosition + bytesToNumber(cursor.readBytes(sizeOfOffset));
		for (let i = 0; i < param.components.length; ++i) {
			const component = param.components[i];
			cursor.setPosition(start + consumed);
			const [data, consumed_] = decodeParameter(cursor, component, { staticPosition: start });
			consumed += consumed_;
			value[hasUnnamedChild ? i : component?.name] = data;
		}
		cursor.setPosition(staticPosition + 32);
		return [value, 32];
	}
	for (let i = 0; i < param.components.length; ++i) {
		const component = param.components[i];
		const [data, consumed_] = decodeParameter(cursor, component, { staticPosition });
		value[hasUnnamedChild ? i : component?.name] = data;
		consumed += consumed_;
	}
	return [value, consumed];
}
function decodeString(cursor, { staticPosition }) {
	const start = staticPosition + bytesToNumber(cursor.readBytes(32));
	cursor.setPosition(start);
	const length = bytesToNumber(cursor.readBytes(32));
	if (length === 0) {
		cursor.setPosition(staticPosition + 32);
		return ["", 32];
	}
	const value = bytesToString(cursor.readBytes(length, 32));
	cursor.setPosition(staticPosition + 32);
	return [value, 32];
}
function hasDynamicChild(param) {
	const { type } = param;
	if (type === "string") return true;
	if (type === "bytes") return true;
	if (type.endsWith("[]")) return true;
	if (type === "tuple") return param.components?.some(hasDynamicChild);
	const arrayComponents = getArrayComponents(param.type);
	if (arrayComponents && hasDynamicChild({
		...param,
		type: arrayComponents[1]
	})) return true;
	return false;
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/decodeErrorResult.js
function decodeErrorResult(parameters) {
	const { abi, data, cause } = parameters;
	const signature = slice(data, 0, 4);
	if (signature === "0x") throw new AbiDecodingZeroDataError({ cause });
	const abiItem = [
		...abi || [],
		solidityError,
		solidityPanic
	].find((x) => x.type === "error" && signature === toFunctionSelector(formatAbiItem(x)));
	if (!abiItem) throw new AbiErrorSignatureNotFoundError(signature, {
		docsPath: "/docs/contract/decodeErrorResult",
		cause
	});
	return {
		abiItem,
		args: "inputs" in abiItem && abiItem.inputs && abiItem.inputs.length > 0 ? decodeAbiParameters(abiItem.inputs, slice(data, 4)) : void 0,
		errorName: abiItem.name
	};
}
//#endregion
//#region node_modules/viem/_esm/utils/stringify.js
var stringify = (value, replacer, space) => JSON.stringify(value, (key, value_) => {
	const value = typeof value_ === "bigint" ? value_.toString() : value_;
	return typeof replacer === "function" ? replacer(key, value) : value;
}, space);
//#endregion
//#region node_modules/viem/_esm/utils/abi/formatAbiItemWithArgs.js
function formatAbiItemWithArgs({ abiItem, args, includeFunctionName = true, includeName = false }) {
	if (!("name" in abiItem)) return;
	if (!("inputs" in abiItem)) return;
	if (!abiItem.inputs) return;
	return `${includeFunctionName ? abiItem.name : ""}(${abiItem.inputs.map((input, i) => `${includeName && input.name ? `${input.name}: ` : ""}${typeof args[i] === "object" ? stringify(args[i]) : args[i]}`).join(", ")})`;
}
//#endregion
//#region node_modules/viem/_esm/utils/unit/Value.js
/** @see https://ethereum.github.io/yellowpaper/paper.pdf */
var exponents = {
	wei: 0,
	gwei: 9,
	szabo: 12,
	finney: 15,
	ether: 18
};
/**
* Formats a `bigint` Value to its string representation (divided by the given exponent).
*
* @example
* ```ts twoslash
* import { Value } from 'ox'
*
* Value.format(420_000_000_000n, 9)
* // @log: '420'
* ```
*
* @param value - The `bigint` Value to format.
* @param decimals - The exponent to divide the `bigint` Value by.
* @returns The string representation of the Value.
*/
function format(value, decimals = 0) {
	if (!Number.isInteger(decimals) || decimals < 0) throw new InvalidDecimalsError({ decimals });
	let display = value.toString();
	const negative = display.startsWith("-");
	if (negative) display = display.slice(1);
	display = display.padStart(decimals, "0");
	let [integer, fraction] = [display.slice(0, display.length - decimals), display.slice(display.length - decimals)];
	fraction = fraction.replace(/(0+)$/, "");
	return `${negative ? "-" : ""}${integer || "0"}${fraction ? `.${fraction}` : ""}`;
}
/**
* Formats a `bigint` Value (default: wei) to a string representation of Ether.
*
* @example
* ```ts twoslash
* import { Value } from 'ox'
*
* Value.formatEther(1_000_000_000_000_000_000n)
* // @log: '1'
* ```
*
* @param wei - The Value to format.
* @param unit - The unit to format the Value in. @default 'wei'.
* @returns The Ether string representation of the Value.
*/
function formatEther$1(wei, unit = "wei") {
	return format(wei, exponents.ether - exponents[unit]);
}
/**
* Formats a `bigint` Value (default: wei) to a string representation of Gwei.
*
* @example
* ```ts twoslash
* import { Value } from 'ox'
*
* Value.formatGwei(1_000_000_000n)
* // @log: '1'
* ```
*
* @param wei - The Value to format.
* @param unit - The unit to format the Value in. @default 'wei'.
* @returns The Gwei string representation of the Value.
*/
function formatGwei$1(wei, unit = "wei") {
	return format(wei, exponents.gwei - exponents[unit]);
}
/**
* Parses a `string` representation of a Value to `bigint` (multiplied by the given exponent).
*
* @example
* ```ts twoslash
* import { Value } from 'ox'
*
* Value.from('420', 9)
* // @log: 420000000000n
* ```
*
* @param value - The string representation of the Value.
* @param decimals - The exponent to multiply the Value by.
* @returns The `bigint` representation of the Value.
*/
function from(value, decimals = 0) {
	if (!Number.isInteger(decimals) || decimals < 0) throw new InvalidDecimalsError({ decimals });
	if (!/^-?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)$/.test(value)) throw new InvalidDecimalNumberError({ value });
	let [integer = "", fraction = "0"] = value.split(".");
	const negative = integer.startsWith("-");
	if (negative) integer = integer.slice(1);
	if (integer === "") integer = "0";
	fraction = fraction.replace(/(0+)$/, "");
	if (decimals === 0) {
		if (fraction.length > 0 && Number.parseInt(fraction[0], 10) >= 5) integer = `${BigInt(integer) + 1n}`;
		fraction = "";
	} else if (fraction.length > decimals) {
		const left = fraction.slice(0, decimals);
		if (Number.parseInt(fraction.slice(decimals, decimals + 1), 10) >= 5) {
			const carried = carry(left);
			if (carried.length > decimals) {
				fraction = carried.slice(1);
				integer = `${BigInt(integer) + 1n}`;
			} else fraction = carried;
		} else fraction = left;
	} else fraction = fraction.padEnd(decimals, "0");
	return BigInt(`${negative ? "-" : ""}${integer}${fraction}`);
}
/**
* Adds 1 to a digit string with carry, returning a string of the same length
* unless the carry overflows past the most-significant digit (in which case
* the returned string is one digit longer).
*
* @internal
*/
function carry(digits) {
	const out = digits.split("");
	let i = out.length - 1;
	while (i >= 0) {
		const d = Number.parseInt(out[i], 10) + 1;
		if (d < 10) {
			out[i] = String(d);
			return out.join("");
		}
		out[i] = "0";
		i--;
	}
	return `1${out.join("")}`;
}
/**
* Parses a string representation of Ether to a `bigint` Value (default: wei).
*
* @example
* ```ts twoslash
* import { Value } from 'ox'
*
* Value.fromEther('420')
* // @log: 420000000000000000000n
* ```
*
* @param ether - String representation of Ether.
* @param unit - The unit to parse to. @default 'wei'.
* @returns A `bigint` Value.
*/
function fromEther(ether, unit = "wei") {
	return from(ether, exponents.ether - exponents[unit]);
}
/**
* Thrown when a value is not a valid decimal number.
*
* @example
* ```ts twoslash
* import { Value } from 'ox'
*
* Value.fromEther('123.456.789')
* // @error: Value.InvalidDecimalNumberError: Value `123.456.789` is not a valid decimal number.
* ```
*/
var InvalidDecimalNumberError = class extends Error {
	constructor({ value }) {
		super(`Value \`${value}\` is not a valid decimal number.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Value.InvalidDecimalNumberError"
		});
	}
};
/**
* Thrown when the `decimals` argument is not a non-negative integer.
*
* @example
* ```ts twoslash
* import { Value } from 'ox'
*
* Value.from('1', -1)
* // @error: Value.InvalidDecimalsError: `decimals` must be a non-negative integer. Got `-1`.
* ```
*/
var InvalidDecimalsError = class extends Error {
	constructor({ decimals }) {
		super(`\`decimals\` must be a non-negative integer. Got \`${decimals}\`.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Value.InvalidDecimalsError"
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/unit/formatEther.js
/**
* Converts numerical wei to a string representation of ether.
*
* - Docs: https://viem.sh/docs/utilities/formatEther
*
* @example
* import { formatEther } from 'viem'
*
* formatEther(1000000000000000000n)
* // '1'
*/
function formatEther(wei, unit = "wei") {
	return formatEther$1(wei, unit);
}
//#endregion
//#region node_modules/viem/_esm/utils/unit/formatGwei.js
/**
* Converts numerical wei to a string representation of gwei.
*
* - Docs: https://viem.sh/docs/utilities/formatGwei
*
* @example
* import { formatGwei } from 'viem'
*
* formatGwei(1000000000n)
* // '1'
*/
function formatGwei(wei, unit = "wei") {
	return formatGwei$1(wei, unit);
}
//#endregion
//#region node_modules/viem/_esm/errors/stateOverride.js
var AccountStateConflictError = class extends BaseError {
	constructor({ address }) {
		super(`State for account "${address}" is set multiple times.`, { name: "AccountStateConflictError" });
	}
};
var StateAssignmentConflictError = class extends BaseError {
	constructor() {
		super("state and stateDiff are set on the same account.", { name: "StateAssignmentConflictError" });
	}
};
/** @internal */
function prettyStateMapping(stateMapping) {
	return stateMapping.reduce((pretty, { slot, value }) => {
		return `${pretty}        ${slot}: ${value}\n`;
	}, "");
}
function prettyStateOverride(stateOverride) {
	return stateOverride.reduce((pretty, { address, ...state }) => {
		let val = `${pretty}    ${address}:\n`;
		if (state.nonce) val += `      nonce: ${state.nonce}\n`;
		if (state.balance) val += `      balance: ${state.balance}\n`;
		if (state.code) val += `      code: ${state.code}\n`;
		if (state.state) {
			val += "      state:\n";
			val += prettyStateMapping(state.state);
		}
		if (state.stateDiff) {
			val += "      stateDiff:\n";
			val += prettyStateMapping(state.stateDiff);
		}
		return val;
	}, "  State Override:\n").slice(0, -1);
}
//#endregion
//#region node_modules/viem/_esm/errors/transaction.js
function prettyPrint(args) {
	const entries = Object.entries(args).map(([key, value]) => {
		if (value === void 0 || value === false) return null;
		return [key, value];
	}).filter(Boolean);
	const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0);
	return entries.map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`).join("\n");
}
var FeePayerNonceMismatchError = class extends BaseError {
	constructor({ filledNonce, requestedNonce }) {
		super("The filled transaction nonce does not match the requested nonce.", {
			metaMessages: [`Requested Nonce: ${requestedNonce}`, `Filled Nonce: ${filledNonce}`],
			name: "FeePayerNonceMismatchError"
		});
	}
};
var InvalidSerializableTransactionError = class extends BaseError {
	constructor({ transaction }) {
		super("Cannot infer a transaction type from provided transaction.", {
			metaMessages: [
				"Provided Transaction:",
				"{",
				prettyPrint(transaction),
				"}",
				"",
				"To infer the type, either provide:",
				"- a `type` to the Transaction, or",
				"- an EIP-1559 Transaction with `maxFeePerGas`, or",
				"- an EIP-2930 Transaction with `gasPrice` & `accessList`, or",
				"- an EIP-4844 Transaction with `blobs`, `blobVersionedHashes`, `sidecars`, or",
				"- an EIP-7702 Transaction with `authorizationList`, or",
				"- a Legacy Transaction with `gasPrice`"
			],
			name: "InvalidSerializableTransactionError"
		});
	}
};
var TransactionExecutionError = class extends BaseError {
	constructor(cause, { account, docsPath, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
		const prettyArgs = prettyPrint({
			chain: chain && `${chain?.name} (id: ${chain?.id})`,
			from: account?.address,
			to,
			value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
			data,
			gas,
			gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
			maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
			maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
			nonce
		});
		super(cause.shortMessage, {
			cause,
			docsPath,
			metaMessages: [
				...cause.metaMessages ? [...cause.metaMessages, " "] : [],
				"Request Arguments:",
				prettyArgs
			].filter(Boolean),
			name: "TransactionExecutionError"
		});
		Object.defineProperty(this, "cause", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.cause = cause;
	}
};
var TransactionNotFoundError = class extends BaseError {
	constructor({ blockHash, blockNumber, blockTag, hash, index }) {
		let identifier = "Transaction";
		if (blockTag && index !== void 0) identifier = `Transaction at block time "${blockTag}" at index "${index}"`;
		if (blockHash && index !== void 0) identifier = `Transaction at block hash "${blockHash}" at index "${index}"`;
		if (blockNumber && index !== void 0) identifier = `Transaction at block number "${blockNumber}" at index "${index}"`;
		if (hash) identifier = `Transaction with hash "${hash}"`;
		super(`${identifier} could not be found.`, { name: "TransactionNotFoundError" });
	}
};
var TransactionReceiptNotFoundError = class extends BaseError {
	constructor({ hash }) {
		super(`Transaction receipt with hash "${hash}" could not be found. The Transaction may not be processed on a block yet.`, { name: "TransactionReceiptNotFoundError" });
	}
};
var TransactionReceiptRevertedError = class extends BaseError {
	constructor({ receipt }) {
		super(`Transaction with hash "${receipt.transactionHash}" reverted.`, {
			metaMessages: [
				"The receipt marked the transaction as \"reverted\". This could mean that the function on the contract you are trying to call threw an error.",
				" ",
				"You can attempt to extract the revert reason by:",
				"- calling the `simulateContract` or `simulateCalls` Action with the `abi` and `functionName` of the contract",
				"- using the `call` Action with raw `data`"
			],
			name: "TransactionReceiptRevertedError"
		});
		Object.defineProperty(this, "receipt", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.receipt = receipt;
	}
};
var WaitForTransactionReceiptTimeoutError = class extends BaseError {
	constructor({ hash }) {
		super(`Timed out while waiting for transaction with hash "${hash}" to be confirmed.`, { name: "WaitForTransactionReceiptTimeoutError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/errors/utils.js
var getContractAddress = (address) => address;
function getAbortError(signal) {
	if (signal?.reason) return signal.reason;
	if (typeof DOMException === "function") return new DOMException("This operation was aborted", "AbortError");
	const error = /* @__PURE__ */ new Error("This operation was aborted");
	error.name = "AbortError";
	return error;
}
function isAbortError(error) {
	return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}
/**
* Returns the URL with any embedded basic-auth credentials stripped, so
* error messages and logs don't leak secrets when an RPC URL like
* `https://user:pass@host` is used.
*/
var getUrl = (url) => {
	try {
		const parsed = new URL(url);
		if (!parsed.username && !parsed.password) return url;
		parsed.username = "";
		parsed.password = "";
		return parsed.toString();
	} catch {
		return url;
	}
};
//#endregion
//#region node_modules/viem/_esm/errors/contract.js
var CallExecutionError = class extends BaseError {
	constructor(cause, { account: account_, docsPath, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value, stateOverride }) {
		let prettyArgs = prettyPrint({
			from: (account_ ? parseAccount(account_) : void 0)?.address,
			to,
			value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
			data,
			gas,
			gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
			maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
			maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
			nonce
		});
		if (stateOverride) prettyArgs += `\n${prettyStateOverride(stateOverride)}`;
		super(cause.shortMessage, {
			cause,
			docsPath,
			metaMessages: [
				...cause.metaMessages ? [...cause.metaMessages, " "] : [],
				"Raw Call Arguments:",
				prettyArgs
			].filter(Boolean),
			name: "CallExecutionError"
		});
		Object.defineProperty(this, "cause", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.cause = cause;
	}
};
var ContractFunctionExecutionError = class extends BaseError {
	constructor(cause, { abi, args, contractAddress, docsPath, functionName, sender }) {
		const abiItem = getAbiItem({
			abi,
			args,
			name: functionName
		});
		const formattedArgs = abiItem ? formatAbiItemWithArgs({
			abiItem,
			args,
			includeFunctionName: false,
			includeName: false
		}) : void 0;
		const functionWithParams = abiItem ? formatAbiItem(abiItem, { includeName: true }) : void 0;
		const prettyArgs = prettyPrint({
			address: contractAddress && getContractAddress(contractAddress),
			function: functionWithParams,
			args: formattedArgs && formattedArgs !== "()" && `${[...Array(functionName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}`,
			sender
		});
		super(cause.shortMessage || `An unknown error occurred while executing the contract function "${functionName}".`, {
			cause,
			docsPath,
			metaMessages: [
				...cause.metaMessages ? [...cause.metaMessages, " "] : [],
				prettyArgs && "Contract Call:",
				prettyArgs
			].filter(Boolean),
			name: "ContractFunctionExecutionError"
		});
		Object.defineProperty(this, "abi", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "args", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "cause", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "contractAddress", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "formattedArgs", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "functionName", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "sender", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.abi = abi;
		this.args = args;
		this.cause = cause;
		this.contractAddress = contractAddress;
		this.functionName = functionName;
		this.sender = sender;
	}
};
var ContractFunctionRevertedError = class extends BaseError {
	constructor({ abi, data, functionName, message, cause: error }) {
		let cause;
		let decodedData;
		let metaMessages;
		let reason;
		if (data && data !== "0x") try {
			decodedData = decodeErrorResult({
				abi,
				data,
				cause: error
			});
			const { abiItem, errorName, args: errorArgs } = decodedData;
			if (errorName === "Error") reason = errorArgs[0];
			else if (errorName === "Panic") {
				const [firstArg] = errorArgs;
				reason = panicReasons[firstArg];
			} else {
				const errorWithParams = abiItem ? formatAbiItem(abiItem, { includeName: true }) : void 0;
				const formattedArgs = abiItem && errorArgs ? formatAbiItemWithArgs({
					abiItem,
					args: errorArgs,
					includeFunctionName: false,
					includeName: false
				}) : void 0;
				metaMessages = [errorWithParams ? `Error: ${errorWithParams}` : "", formattedArgs && formattedArgs !== "()" ? `       ${[...Array(errorName?.length ?? 0).keys()].map(() => " ").join("")}${formattedArgs}` : ""];
			}
		} catch (err) {
			cause = err;
		}
		else if (message) reason = message;
		let signature;
		if (cause instanceof AbiErrorSignatureNotFoundError) {
			signature = cause.signature;
			metaMessages = [
				`Unable to decode signature "${signature}" as it was not found on the provided ABI.`,
				"Make sure you are using the correct ABI and that the error exists on it.",
				`You can look up the decoded signature here: https://4byte.sourcify.dev/?q=${signature}.`
			];
		}
		super(reason && reason !== "execution reverted" || signature ? [`The contract function "${functionName}" reverted with the following ${signature ? "signature" : "reason"}:`, reason || signature].join("\n") : `The contract function "${functionName}" reverted.`, {
			cause: cause ?? error,
			metaMessages,
			name: "ContractFunctionRevertedError"
		});
		Object.defineProperty(this, "data", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "raw", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "reason", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "signature", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.data = decodedData;
		this.raw = data;
		this.reason = reason;
		this.signature = signature;
	}
};
var ContractFunctionZeroDataError = class extends BaseError {
	constructor({ functionName, cause }) {
		super(`The contract function "${functionName}" returned no data ("0x").`, {
			metaMessages: [
				"This could be due to any of the following:",
				`  - The contract does not have the function "${functionName}",`,
				"  - The parameters passed to the contract function may be invalid, or",
				"  - The address is not a contract."
			],
			name: "ContractFunctionZeroDataError",
			cause
		});
	}
};
var CounterfactualDeploymentFailedError = class extends BaseError {
	constructor({ factory }) {
		super(`Deployment for counterfactual contract call failed${factory ? ` for factory "${factory}".` : ""}`, {
			metaMessages: [
				"Please ensure:",
				"- The `factory` is a valid contract deployment factory (ie. Create2 Factory, ERC-4337 Factory, etc).",
				"- The `factoryData` is a valid encoded function call for contract deployment function on the factory."
			],
			name: "CounterfactualDeploymentFailedError"
		});
	}
};
var RawContractError = class extends BaseError {
	constructor({ data, message }) {
		super(message || "", { name: "RawContractError" });
		Object.defineProperty(this, "code", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: 3
		});
		Object.defineProperty(this, "data", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.data = data;
	}
};
//#endregion
//#region node_modules/viem/_esm/errors/request.js
var HttpRequestError = class extends BaseError {
	constructor({ body, cause, details, headers, status, url }) {
		super("HTTP request failed.", {
			cause,
			details,
			metaMessages: [
				status && `Status: ${status}`,
				`URL: ${getUrl(url)}`,
				body && `Request body: ${stringify(body)}`
			].filter(Boolean),
			name: "HttpRequestError"
		});
		Object.defineProperty(this, "body", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "headers", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "status", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "url", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.body = body;
		this.headers = headers;
		this.status = status;
		this.url = url;
	}
};
var ResponseBodyTooLargeError = class extends BaseError {
	constructor({ maxSize, size }) {
		super("HTTP response body exceeded the size limit.", {
			metaMessages: [`Max: ${maxSize} bytes`, `Received: ${size} bytes`],
			name: "ResponseBodyTooLargeError"
		});
		Object.defineProperty(this, "maxSize", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "size", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.maxSize = maxSize;
		this.size = size;
	}
};
var RpcRequestError = class extends BaseError {
	constructor({ body, error, url }) {
		super("RPC Request failed.", {
			cause: error,
			details: error.message,
			metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
			name: "RpcRequestError"
		});
		Object.defineProperty(this, "code", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "data", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "url", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.code = error.code;
		this.data = error.data;
		this.url = url;
	}
};
var TimeoutError = class extends BaseError {
	constructor({ body, url }) {
		super("The request took too long to respond.", {
			details: "The request timed out.",
			metaMessages: [`URL: ${getUrl(url)}`, `Request body: ${stringify(body)}`],
			name: "TimeoutError"
		});
		Object.defineProperty(this, "url", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.url = url;
	}
};
//#endregion
//#region node_modules/viem/_esm/errors/rpc.js
var unknownErrorCode = -1;
var RpcError = class extends BaseError {
	constructor(cause, { code, docsPath, metaMessages, name, shortMessage }) {
		super(shortMessage, {
			cause,
			docsPath,
			metaMessages: metaMessages || cause?.metaMessages,
			name: name || "RpcError"
		});
		Object.defineProperty(this, "code", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.name = name || cause.name;
		this.code = cause instanceof RpcRequestError ? cause.code : code ?? unknownErrorCode;
	}
};
var ProviderRpcError = class extends RpcError {
	constructor(cause, options) {
		super(cause, options);
		Object.defineProperty(this, "data", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.data = options.data;
	}
};
var ParseRpcError = class ParseRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: ParseRpcError.code,
			name: "ParseRpcError",
			shortMessage: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSON text."
		});
	}
};
Object.defineProperty(ParseRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32700
});
var InvalidRequestRpcError = class InvalidRequestRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: InvalidRequestRpcError.code,
			name: "InvalidRequestRpcError",
			shortMessage: "JSON is not a valid request object."
		});
	}
};
Object.defineProperty(InvalidRequestRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32600
});
var MethodNotFoundRpcError = class MethodNotFoundRpcError extends RpcError {
	constructor(cause, { method } = {}) {
		super(cause, {
			code: MethodNotFoundRpcError.code,
			name: "MethodNotFoundRpcError",
			shortMessage: `The method${method ? ` "${method}"` : ""} does not exist / is not available.`
		});
	}
};
Object.defineProperty(MethodNotFoundRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32601
});
var InvalidParamsRpcError = class InvalidParamsRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: InvalidParamsRpcError.code,
			name: "InvalidParamsRpcError",
			shortMessage: ["Invalid parameters were provided to the RPC method.", "Double check you have provided the correct parameters."].join("\n")
		});
	}
};
Object.defineProperty(InvalidParamsRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32602
});
var InternalRpcError = class InternalRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: InternalRpcError.code,
			name: "InternalRpcError",
			shortMessage: "An internal error was received."
		});
	}
};
Object.defineProperty(InternalRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32603
});
var InvalidInputRpcError = class InvalidInputRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: InvalidInputRpcError.code,
			name: "InvalidInputRpcError",
			shortMessage: ["Missing or invalid parameters.", "Double check you have provided the correct parameters."].join("\n")
		});
	}
};
Object.defineProperty(InvalidInputRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32e3
});
var ResourceNotFoundRpcError = class ResourceNotFoundRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: ResourceNotFoundRpcError.code,
			name: "ResourceNotFoundRpcError",
			shortMessage: "Requested resource not found."
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "ResourceNotFoundRpcError"
		});
	}
};
Object.defineProperty(ResourceNotFoundRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32001
});
var ResourceUnavailableRpcError = class ResourceUnavailableRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: ResourceUnavailableRpcError.code,
			name: "ResourceUnavailableRpcError",
			shortMessage: "Requested resource not available."
		});
	}
};
Object.defineProperty(ResourceUnavailableRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32002
});
var TransactionRejectedRpcError = class TransactionRejectedRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: TransactionRejectedRpcError.code,
			name: "TransactionRejectedRpcError",
			shortMessage: "Transaction creation failed."
		});
	}
};
Object.defineProperty(TransactionRejectedRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32003
});
var MethodNotSupportedRpcError = class MethodNotSupportedRpcError extends RpcError {
	constructor(cause, { method } = {}) {
		super(cause, {
			code: MethodNotSupportedRpcError.code,
			name: "MethodNotSupportedRpcError",
			shortMessage: `Method${method ? ` "${method}"` : ""} is not supported.`
		});
	}
};
Object.defineProperty(MethodNotSupportedRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32004
});
var LimitExceededRpcError = class LimitExceededRpcError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: LimitExceededRpcError.code,
			name: "LimitExceededRpcError",
			shortMessage: "Request exceeds defined limit."
		});
	}
};
Object.defineProperty(LimitExceededRpcError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32005
});
var JsonRpcVersionUnsupportedError = class JsonRpcVersionUnsupportedError extends RpcError {
	constructor(cause) {
		super(cause, {
			code: JsonRpcVersionUnsupportedError.code,
			name: "JsonRpcVersionUnsupportedError",
			shortMessage: "Version of JSON-RPC protocol is not supported."
		});
	}
};
Object.defineProperty(JsonRpcVersionUnsupportedError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: -32006
});
var UserRejectedRequestError = class UserRejectedRequestError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: UserRejectedRequestError.code,
			name: "UserRejectedRequestError",
			shortMessage: "User rejected the request."
		});
	}
};
Object.defineProperty(UserRejectedRequestError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 4001
});
var UnauthorizedProviderError = class UnauthorizedProviderError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: UnauthorizedProviderError.code,
			name: "UnauthorizedProviderError",
			shortMessage: "The requested method and/or account has not been authorized by the user."
		});
	}
};
Object.defineProperty(UnauthorizedProviderError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 4100
});
var UnsupportedProviderMethodError = class UnsupportedProviderMethodError extends ProviderRpcError {
	constructor(cause, { method } = {}) {
		super(cause, {
			code: UnsupportedProviderMethodError.code,
			name: "UnsupportedProviderMethodError",
			shortMessage: `The Provider does not support the requested method${method ? ` " ${method}"` : ""}.`
		});
	}
};
Object.defineProperty(UnsupportedProviderMethodError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 4200
});
var ProviderDisconnectedError = class ProviderDisconnectedError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: ProviderDisconnectedError.code,
			name: "ProviderDisconnectedError",
			shortMessage: "The Provider is disconnected from all chains."
		});
	}
};
Object.defineProperty(ProviderDisconnectedError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 4900
});
var ChainDisconnectedError = class ChainDisconnectedError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: ChainDisconnectedError.code,
			name: "ChainDisconnectedError",
			shortMessage: "The Provider is not connected to the requested chain."
		});
	}
};
Object.defineProperty(ChainDisconnectedError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 4901
});
var SwitchChainError = class SwitchChainError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: SwitchChainError.code,
			name: "SwitchChainError",
			shortMessage: "An error occurred when attempting to switch chain."
		});
	}
};
Object.defineProperty(SwitchChainError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 4902
});
var UnsupportedNonOptionalCapabilityError = class UnsupportedNonOptionalCapabilityError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: UnsupportedNonOptionalCapabilityError.code,
			name: "UnsupportedNonOptionalCapabilityError",
			shortMessage: "This Wallet does not support a capability that was not marked as optional."
		});
	}
};
Object.defineProperty(UnsupportedNonOptionalCapabilityError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 5700
});
var UnsupportedChainIdError = class UnsupportedChainIdError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: UnsupportedChainIdError.code,
			name: "UnsupportedChainIdError",
			shortMessage: "This Wallet does not support the requested chain ID."
		});
	}
};
Object.defineProperty(UnsupportedChainIdError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 5710
});
var DuplicateIdError = class DuplicateIdError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: DuplicateIdError.code,
			name: "DuplicateIdError",
			shortMessage: "There is already a bundle submitted with this ID."
		});
	}
};
Object.defineProperty(DuplicateIdError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 5720
});
var UnknownBundleIdError = class UnknownBundleIdError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: UnknownBundleIdError.code,
			name: "UnknownBundleIdError",
			shortMessage: "This bundle id is unknown / has not been submitted"
		});
	}
};
Object.defineProperty(UnknownBundleIdError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 5730
});
var BundleTooLargeError = class BundleTooLargeError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: BundleTooLargeError.code,
			name: "BundleTooLargeError",
			shortMessage: "The call bundle is too large for the Wallet to process."
		});
	}
};
Object.defineProperty(BundleTooLargeError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 5740
});
var AtomicReadyWalletRejectedUpgradeError = class AtomicReadyWalletRejectedUpgradeError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: AtomicReadyWalletRejectedUpgradeError.code,
			name: "AtomicReadyWalletRejectedUpgradeError",
			shortMessage: "The Wallet can support atomicity after an upgrade, but the user rejected the upgrade."
		});
	}
};
Object.defineProperty(AtomicReadyWalletRejectedUpgradeError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 5750
});
var AtomicityNotSupportedError = class AtomicityNotSupportedError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: AtomicityNotSupportedError.code,
			name: "AtomicityNotSupportedError",
			shortMessage: "The wallet does not support atomic execution but the request requires it."
		});
	}
};
Object.defineProperty(AtomicityNotSupportedError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 5760
});
var WalletConnectSessionSettlementError = class WalletConnectSessionSettlementError extends ProviderRpcError {
	constructor(cause) {
		super(cause, {
			code: WalletConnectSessionSettlementError.code,
			name: "WalletConnectSessionSettlementError",
			shortMessage: "WalletConnect session settlement failed."
		});
	}
};
Object.defineProperty(WalletConnectSessionSettlementError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 7e3
});
var UnknownRpcError = class extends RpcError {
	constructor(cause) {
		super(cause, {
			name: "UnknownRpcError",
			shortMessage: "An unknown RPC error occurred."
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/errors/getContractError.js
var EXECUTION_REVERTED_ERROR_CODE = 3;
function getContractError(err, { abi, address, args, docsPath, functionName, sender }) {
	const error = err instanceof RawContractError ? err : err instanceof BaseError ? err.walk((err) => "data" in err) || err.walk() : {};
	const { code, data, details, message, shortMessage } = error;
	return new ContractFunctionExecutionError((() => {
		if (err instanceof AbiDecodingZeroDataError) return new ContractFunctionZeroDataError({
			functionName,
			cause: err
		});
		if ([EXECUTION_REVERTED_ERROR_CODE, InternalRpcError.code].includes(code) && (data || details || message || shortMessage) || code === InvalidInputRpcError.code && details === "execution reverted" && data) return new ContractFunctionRevertedError({
			abi,
			data: typeof data === "object" ? data.data : data,
			functionName,
			message: error instanceof RpcRequestError ? details : shortMessage ?? message,
			cause: err
		});
		return err;
	})(), {
		abi,
		args,
		contractAddress: address,
		docsPath,
		functionName,
		sender
	});
}
//#endregion
//#region node_modules/viem/_esm/accounts/utils/publicKeyToAddress.js
/**
* @description Converts an ECDSA public key to an address.
*
* @param publicKey The public key to convert.
*
* @returns The address.
*/
function publicKeyToAddress(publicKey) {
	return checksumAddress(`0x${keccak256(`0x${publicKey.substring(4)}`).substring(26)}`);
}
//#endregion
//#region node_modules/viem/_esm/utils/signature/recoverPublicKey.js
async function recoverPublicKey({ hash, signature }) {
	const hashHex = isHex(hash) ? hash : toHex(hash);
	const { secp256k1 } = await import("./noble__curves+noble__hashes.mjs").then((n) => n.n);
	return `0x${(() => {
		if (typeof signature === "object" && "r" in signature && "s" in signature) {
			const { r, s, v, yParity } = signature;
			const recoveryBit = toRecoveryBit(Number(yParity ?? v));
			return new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).addRecoveryBit(recoveryBit);
		}
		const signatureHex = isHex(signature) ? signature : toHex(signature);
		if (size$1(signatureHex) !== 65) throw new Error("invalid signature length");
		const recoveryBit = toRecoveryBit(hexToNumber(`0x${signatureHex.slice(130)}`));
		return secp256k1.Signature.fromCompact(signatureHex.substring(2, 130)).addRecoveryBit(recoveryBit);
	})().recoverPublicKey(hashHex.substring(2)).toHex(false)}`;
}
function toRecoveryBit(yParityOrV) {
	if (yParityOrV === 0 || yParityOrV === 1) return yParityOrV;
	if (yParityOrV === 27) return 0;
	if (yParityOrV === 28) return 1;
	throw new Error("Invalid yParityOrV value");
}
//#endregion
//#region node_modules/viem/_esm/utils/signature/recoverAddress.js
async function recoverAddress({ hash, signature }) {
	return publicKeyToAddress(await recoverPublicKey({
		hash,
		signature
	}));
}
//#endregion
//#region node_modules/viem/_esm/utils/encoding/toRlp.js
function toRlp(bytes, to = "hex") {
	const encodable = getEncodable(bytes);
	const cursor = createCursor(new Uint8Array(encodable.length));
	encodable.encode(cursor);
	if (to === "hex") return bytesToHex(cursor.bytes);
	return cursor.bytes;
}
function getEncodable(bytes) {
	if (Array.isArray(bytes)) return getEncodableList(bytes.map((x) => getEncodable(x)));
	return getEncodableBytes(bytes);
}
function getEncodableList(list) {
	const bodyLength = list.reduce((acc, x) => acc + x.length, 0);
	const sizeOfBodyLength = getSizeOfLength(bodyLength);
	return {
		length: (() => {
			if (bodyLength <= 55) return 1 + bodyLength;
			return 1 + sizeOfBodyLength + bodyLength;
		})(),
		encode(cursor) {
			if (bodyLength <= 55) cursor.pushByte(192 + bodyLength);
			else {
				cursor.pushByte(247 + sizeOfBodyLength);
				if (sizeOfBodyLength === 1) cursor.pushUint8(bodyLength);
				else if (sizeOfBodyLength === 2) cursor.pushUint16(bodyLength);
				else if (sizeOfBodyLength === 3) cursor.pushUint24(bodyLength);
				else cursor.pushUint32(bodyLength);
			}
			for (const { encode } of list) encode(cursor);
		}
	};
}
function getEncodableBytes(bytesOrHex) {
	const bytes = typeof bytesOrHex === "string" ? hexToBytes(bytesOrHex) : bytesOrHex;
	const sizeOfBytesLength = getSizeOfLength(bytes.length);
	return {
		length: (() => {
			if (bytes.length === 1 && bytes[0] < 128) return 1;
			if (bytes.length <= 55) return 1 + bytes.length;
			return 1 + sizeOfBytesLength + bytes.length;
		})(),
		encode(cursor) {
			if (bytes.length === 1 && bytes[0] < 128) cursor.pushBytes(bytes);
			else if (bytes.length <= 55) {
				cursor.pushByte(128 + bytes.length);
				cursor.pushBytes(bytes);
			} else {
				cursor.pushByte(183 + sizeOfBytesLength);
				if (sizeOfBytesLength === 1) cursor.pushUint8(bytes.length);
				else if (sizeOfBytesLength === 2) cursor.pushUint16(bytes.length);
				else if (sizeOfBytesLength === 3) cursor.pushUint24(bytes.length);
				else cursor.pushUint32(bytes.length);
				cursor.pushBytes(bytes);
			}
		}
	};
}
function getSizeOfLength(length) {
	if (length < 256) return 1;
	if (length < 2 ** 16) return 2;
	if (length < 2 ** 24) return 3;
	if (length < 2 ** 32) return 4;
	throw new BaseError("Length is too large.");
}
//#endregion
//#region node_modules/viem/_esm/utils/authorization/hashAuthorization.js
/**
* Computes an Authorization hash in [EIP-7702 format](https://eips.ethereum.org/EIPS/eip-7702): `keccak256('0x05' || rlp([chain_id, address, nonce]))`.
*/
function hashAuthorization(parameters) {
	const { chainId, nonce, to } = parameters;
	const address = parameters.contractAddress ?? parameters.address;
	const hash = keccak256(concatHex(["0x05", toRlp([
		chainId ? numberToHex(chainId) : "0x",
		address,
		nonce ? numberToHex(nonce) : "0x"
	])]));
	if (to === "bytes") return hexToBytes(hash);
	return hash;
}
//#endregion
//#region node_modules/viem/_esm/utils/authorization/recoverAuthorizationAddress.js
async function recoverAuthorizationAddress(parameters) {
	const { authorization, signature } = parameters;
	return recoverAddress({
		hash: hashAuthorization(authorization),
		signature: signature ?? authorization
	});
}
//#endregion
//#region node_modules/viem/_esm/errors/estimateGas.js
var EstimateGasExecutionError = class extends BaseError {
	constructor(cause, { account, docsPath, chain, data, gas, gasPrice, maxFeePerGas, maxPriorityFeePerGas, nonce, to, value }) {
		const prettyArgs = prettyPrint({
			from: account?.address,
			to,
			value: typeof value !== "undefined" && `${formatEther(value)} ${chain?.nativeCurrency?.symbol || "ETH"}`,
			data,
			gas,
			gasPrice: typeof gasPrice !== "undefined" && `${formatGwei(gasPrice)} gwei`,
			maxFeePerGas: typeof maxFeePerGas !== "undefined" && `${formatGwei(maxFeePerGas)} gwei`,
			maxPriorityFeePerGas: typeof maxPriorityFeePerGas !== "undefined" && `${formatGwei(maxPriorityFeePerGas)} gwei`,
			nonce
		});
		super(cause.shortMessage, {
			cause,
			docsPath,
			metaMessages: [
				...cause.metaMessages ? [...cause.metaMessages, " "] : [],
				"Estimate Gas Arguments:",
				prettyArgs
			].filter(Boolean),
			name: "EstimateGasExecutionError"
		});
		Object.defineProperty(this, "cause", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.cause = cause;
	}
};
//#endregion
//#region node_modules/viem/_esm/errors/node.js
var ExecutionRevertedError = class extends BaseError {
	constructor({ cause, message } = {}) {
		const reason = message?.replace("execution reverted: ", "")?.replace("execution reverted", "");
		super(`Execution reverted ${reason ? `with reason: ${reason}` : "for an unknown reason"}.`, {
			cause,
			name: "ExecutionRevertedError"
		});
	}
};
Object.defineProperty(ExecutionRevertedError, "code", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: 3
});
Object.defineProperty(ExecutionRevertedError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /execution reverted|gas required exceeds allowance/
});
var FeeCapTooHighError = class extends BaseError {
	constructor({ cause, maxFeePerGas } = {}) {
		super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}) cannot be higher than the maximum allowed value (2^256-1).`, {
			cause,
			name: "FeeCapTooHighError"
		});
	}
};
Object.defineProperty(FeeCapTooHighError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /max fee per gas higher than 2\^256-1|fee cap higher than 2\^256-1/
});
var FeeCapTooLowError = class extends BaseError {
	constructor({ cause, maxFeePerGas } = {}) {
		super(`The fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)}` : ""} gwei) cannot be lower than the block base fee.`, {
			cause,
			name: "FeeCapTooLowError"
		});
	}
};
Object.defineProperty(FeeCapTooLowError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /max fee per gas less than block base fee|fee cap less than block base fee|transaction is outdated/
});
var NonceTooHighError = class extends BaseError {
	constructor({ cause, nonce } = {}) {
		super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is higher than the next one expected.`, {
			cause,
			name: "NonceTooHighError"
		});
	}
};
Object.defineProperty(NonceTooHighError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /nonce too high/
});
var NonceTooLowError = class extends BaseError {
	constructor({ cause, nonce } = {}) {
		super([`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}is lower than the current nonce of the account.`, "Try increasing the nonce or find the latest nonce with `getTransactionCount`."].join("\n"), {
			cause,
			name: "NonceTooLowError"
		});
	}
};
Object.defineProperty(NonceTooLowError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /nonce too low|transaction already imported|already known/
});
var NonceMaxValueError = class extends BaseError {
	constructor({ cause, nonce } = {}) {
		super(`Nonce provided for the transaction ${nonce ? `(${nonce}) ` : ""}exceeds the maximum allowed nonce.`, {
			cause,
			name: "NonceMaxValueError"
		});
	}
};
Object.defineProperty(NonceMaxValueError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /nonce has max value/
});
var InsufficientFundsError = class extends BaseError {
	constructor({ cause } = {}) {
		super(["The total cost (gas * gas fee + value) of executing this transaction exceeds the balance of the account."].join("\n"), {
			cause,
			metaMessages: [
				"This error could arise when the account does not have enough funds to:",
				" - pay for the total gas fee,",
				" - pay for the value to send.",
				" ",
				"The cost of the transaction is calculated as `gas * gas fee + value`, where:",
				" - `gas` is the amount of gas needed for transaction to execute,",
				" - `gas fee` is the gas fee,",
				" - `value` is the amount of ether to send to the recipient."
			],
			name: "InsufficientFundsError"
		});
	}
};
Object.defineProperty(InsufficientFundsError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /insufficient funds|exceeds transaction sender account balance/
});
var IntrinsicGasTooHighError = class extends BaseError {
	constructor({ cause, gas } = {}) {
		super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction exceeds the limit allowed for the block.`, {
			cause,
			name: "IntrinsicGasTooHighError"
		});
	}
};
Object.defineProperty(IntrinsicGasTooHighError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /intrinsic gas too high|gas limit reached/
});
var IntrinsicGasTooLowError = class extends BaseError {
	constructor({ cause, gas } = {}) {
		super(`The amount of gas ${gas ? `(${gas}) ` : ""}provided for the transaction is too low.`, {
			cause,
			name: "IntrinsicGasTooLowError"
		});
	}
};
Object.defineProperty(IntrinsicGasTooLowError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /intrinsic gas too low/
});
var TransactionTypeNotSupportedError = class extends BaseError {
	constructor({ cause }) {
		super("The transaction type is not supported for this chain.", {
			cause,
			name: "TransactionTypeNotSupportedError"
		});
	}
};
Object.defineProperty(TransactionTypeNotSupportedError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /transaction type not valid/
});
var TipAboveFeeCapError = class extends BaseError {
	constructor({ cause, maxPriorityFeePerGas, maxFeePerGas } = {}) {
		super([`The provided tip (\`maxPriorityFeePerGas\`${maxPriorityFeePerGas ? ` = ${formatGwei(maxPriorityFeePerGas)} gwei` : ""}) cannot be higher than the fee cap (\`maxFeePerGas\`${maxFeePerGas ? ` = ${formatGwei(maxFeePerGas)} gwei` : ""}).`].join("\n"), {
			cause,
			name: "TipAboveFeeCapError"
		});
	}
};
Object.defineProperty(TipAboveFeeCapError, "nodeMessage", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: /max priority fee per gas higher than max fee per gas|tip higher than fee cap/
});
var UnknownNodeError = class extends BaseError {
	constructor({ cause }) {
		super(`An error occurred while executing: ${cause?.shortMessage}`, {
			cause,
			name: "UnknownNodeError"
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/errors/getNodeError.js
function getNodeError(err, args) {
	const message = (err.details || "").toLowerCase();
	const executionRevertedError = err instanceof BaseError ? err.walk((e) => e?.code === ExecutionRevertedError.code) : err;
	if (executionRevertedError instanceof BaseError) return new ExecutionRevertedError({
		cause: err,
		message: executionRevertedError.details
	});
	if (ExecutionRevertedError.nodeMessage.test(message)) return new ExecutionRevertedError({
		cause: err,
		message: err.details
	});
	if (FeeCapTooHighError.nodeMessage.test(message)) return new FeeCapTooHighError({
		cause: err,
		maxFeePerGas: args?.maxFeePerGas
	});
	if (FeeCapTooLowError.nodeMessage.test(message)) return new FeeCapTooLowError({
		cause: err,
		maxFeePerGas: args?.maxFeePerGas
	});
	if (NonceTooHighError.nodeMessage.test(message)) return new NonceTooHighError({
		cause: err,
		nonce: args?.nonce
	});
	if (NonceTooLowError.nodeMessage.test(message)) return new NonceTooLowError({
		cause: err,
		nonce: args?.nonce
	});
	if (NonceMaxValueError.nodeMessage.test(message)) return new NonceMaxValueError({
		cause: err,
		nonce: args?.nonce
	});
	if (InsufficientFundsError.nodeMessage.test(message)) return new InsufficientFundsError({ cause: err });
	if (IntrinsicGasTooHighError.nodeMessage.test(message)) return new IntrinsicGasTooHighError({
		cause: err,
		gas: args?.gas
	});
	if (IntrinsicGasTooLowError.nodeMessage.test(message)) return new IntrinsicGasTooLowError({
		cause: err,
		gas: args?.gas
	});
	if (TransactionTypeNotSupportedError.nodeMessage.test(message)) return new TransactionTypeNotSupportedError({ cause: err });
	if (TipAboveFeeCapError.nodeMessage.test(message)) return new TipAboveFeeCapError({
		cause: err,
		maxFeePerGas: args?.maxFeePerGas,
		maxPriorityFeePerGas: args?.maxPriorityFeePerGas
	});
	return new UnknownNodeError({ cause: err });
}
//#endregion
//#region node_modules/viem/_esm/utils/errors/getEstimateGasError.js
function getEstimateGasError(err, { docsPath, ...args }) {
	return new EstimateGasExecutionError((() => {
		const cause = getNodeError(err, args);
		if (cause instanceof UnknownNodeError) return err;
		return cause;
	})(), {
		docsPath,
		...args
	});
}
//#endregion
//#region node_modules/viem/_esm/utils/formatters/extract.js
/**
* @description Picks out the keys from `value` that exist in the formatter..
*/
function extract(value_, { format }) {
	if (!format) return {};
	const value = {};
	function extract_(formatted) {
		const keys = Object.keys(formatted);
		for (const key of keys) {
			if (key in value_) value[key] = value_[key];
			if (formatted[key] && typeof formatted[key] === "object" && !Array.isArray(formatted[key])) extract_(formatted[key]);
		}
	}
	extract_(format(value_ || {}));
	return value;
}
//#endregion
//#region node_modules/viem/_esm/utils/formatters/transactionRequest.js
var rpcTransactionType = {
	legacy: "0x0",
	eip2930: "0x1",
	eip1559: "0x2",
	eip4844: "0x3",
	eip7702: "0x4"
};
function formatTransactionRequest(request, _) {
	const rpcRequest = {};
	if (typeof request.authorizationList !== "undefined") rpcRequest.authorizationList = formatAuthorizationList$1(request.authorizationList);
	if (typeof request.accessList !== "undefined") rpcRequest.accessList = request.accessList;
	if (typeof request.blobVersionedHashes !== "undefined") rpcRequest.blobVersionedHashes = request.blobVersionedHashes;
	if (typeof request.blobs !== "undefined") {
		if (typeof request.blobs[0] !== "string") rpcRequest.blobs = request.blobs.map((x) => bytesToHex(x));
		else rpcRequest.blobs = request.blobs;
	}
	if (typeof request.data !== "undefined") rpcRequest.data = request.data;
	if (request.account) rpcRequest.from = request.account.address;
	if (typeof request.from !== "undefined") rpcRequest.from = request.from;
	if (typeof request.gas !== "undefined") rpcRequest.gas = numberToHex(request.gas);
	if (typeof request.gasPrice !== "undefined") rpcRequest.gasPrice = numberToHex(request.gasPrice);
	if (typeof request.maxFeePerBlobGas !== "undefined") rpcRequest.maxFeePerBlobGas = numberToHex(request.maxFeePerBlobGas);
	if (typeof request.maxFeePerGas !== "undefined") rpcRequest.maxFeePerGas = numberToHex(request.maxFeePerGas);
	if (typeof request.maxPriorityFeePerGas !== "undefined") rpcRequest.maxPriorityFeePerGas = numberToHex(request.maxPriorityFeePerGas);
	if (typeof request.nonce !== "undefined") rpcRequest.nonce = numberToHex(request.nonce);
	if (typeof request.to !== "undefined") rpcRequest.to = request.to;
	if (typeof request.type !== "undefined") rpcRequest.type = rpcTransactionType[request.type];
	if (typeof request.value !== "undefined") rpcRequest.value = numberToHex(request.value);
	return rpcRequest;
}
function formatAuthorizationList$1(authorizationList) {
	return authorizationList.map((authorization) => ({
		address: authorization.address,
		r: authorization.r ? numberToHex(BigInt(authorization.r)) : authorization.r,
		s: authorization.s ? numberToHex(BigInt(authorization.s)) : authorization.s,
		chainId: numberToHex(authorization.chainId),
		nonce: numberToHex(authorization.nonce),
		...typeof authorization.yParity !== "undefined" ? { yParity: numberToHex(authorization.yParity) } : {},
		...typeof authorization.v !== "undefined" && typeof authorization.yParity === "undefined" ? { v: numberToHex(authorization.v) } : {}
	}));
}
//#endregion
//#region node_modules/viem/_esm/utils/stateOverride.js
/** @internal */
function serializeStateMapping(stateMapping) {
	if (!stateMapping || stateMapping.length === 0) return void 0;
	return stateMapping.reduce((acc, { slot, value }) => {
		if (slot.length !== 66) throw new InvalidBytesLengthError({
			size: slot.length,
			targetSize: 66,
			type: "hex"
		});
		if (value.length !== 66) throw new InvalidBytesLengthError({
			size: value.length,
			targetSize: 66,
			type: "hex"
		});
		acc[slot] = value;
		return acc;
	}, {});
}
/** @internal */
function serializeAccountStateOverride(parameters) {
	const { balance, nonce, state, stateDiff, code } = parameters;
	const rpcAccountStateOverride = {};
	if (code !== void 0) rpcAccountStateOverride.code = code;
	if (balance !== void 0) rpcAccountStateOverride.balance = numberToHex(balance);
	if (nonce !== void 0) rpcAccountStateOverride.nonce = numberToHex(nonce);
	if (state !== void 0) rpcAccountStateOverride.state = serializeStateMapping(state);
	if (stateDiff !== void 0) {
		if (rpcAccountStateOverride.state) throw new StateAssignmentConflictError();
		rpcAccountStateOverride.stateDiff = serializeStateMapping(stateDiff);
	}
	return rpcAccountStateOverride;
}
/** @internal */
function serializeStateOverride(parameters) {
	if (!parameters) return void 0;
	const rpcStateOverride = {};
	for (const { address, ...accountState } of parameters) {
		if (!isAddress(address, { strict: false })) throw new InvalidAddressError({ address });
		if (rpcStateOverride[address]) throw new AccountStateConflictError({ address });
		rpcStateOverride[address] = serializeAccountStateOverride(accountState);
	}
	return rpcStateOverride;
}
2n ** (8n - 1n) - 1n;
2n ** (16n - 1n) - 1n;
2n ** (24n - 1n) - 1n;
2n ** (32n - 1n) - 1n;
2n ** (40n - 1n) - 1n;
2n ** (48n - 1n) - 1n;
2n ** (56n - 1n) - 1n;
2n ** (64n - 1n) - 1n;
2n ** (72n - 1n) - 1n;
2n ** (80n - 1n) - 1n;
2n ** (88n - 1n) - 1n;
2n ** (96n - 1n) - 1n;
2n ** (104n - 1n) - 1n;
2n ** (112n - 1n) - 1n;
2n ** (120n - 1n) - 1n;
2n ** (128n - 1n) - 1n;
2n ** (136n - 1n) - 1n;
2n ** (144n - 1n) - 1n;
2n ** (152n - 1n) - 1n;
2n ** (160n - 1n) - 1n;
2n ** (168n - 1n) - 1n;
2n ** (176n - 1n) - 1n;
2n ** (184n - 1n) - 1n;
2n ** (192n - 1n) - 1n;
2n ** (200n - 1n) - 1n;
2n ** (208n - 1n) - 1n;
2n ** (216n - 1n) - 1n;
2n ** (224n - 1n) - 1n;
2n ** (232n - 1n) - 1n;
2n ** (240n - 1n) - 1n;
2n ** (248n - 1n) - 1n;
2n ** (256n - 1n) - 1n;
-(2n ** (8n - 1n));
-(2n ** (16n - 1n));
-(2n ** (24n - 1n));
-(2n ** (32n - 1n));
-(2n ** (40n - 1n));
-(2n ** (48n - 1n));
-(2n ** (56n - 1n));
-(2n ** (64n - 1n));
-(2n ** (72n - 1n));
-(2n ** (80n - 1n));
-(2n ** (88n - 1n));
-(2n ** (96n - 1n));
-(2n ** (104n - 1n));
-(2n ** (112n - 1n));
-(2n ** (120n - 1n));
-(2n ** (128n - 1n));
-(2n ** (136n - 1n));
-(2n ** (144n - 1n));
-(2n ** (152n - 1n));
-(2n ** (160n - 1n));
-(2n ** (168n - 1n));
-(2n ** (176n - 1n));
-(2n ** (184n - 1n));
-(2n ** (192n - 1n));
-(2n ** (200n - 1n));
-(2n ** (208n - 1n));
-(2n ** (216n - 1n));
-(2n ** (224n - 1n));
-(2n ** (232n - 1n));
-(2n ** (240n - 1n));
-(2n ** (248n - 1n));
-(2n ** (256n - 1n));
var maxUint256 = 2n ** 256n - 1n;
//#endregion
//#region node_modules/viem/_esm/utils/transaction/assertRequest.js
function assertRequest(args) {
	const { account: account_, maxFeePerGas, maxPriorityFeePerGas, to } = args;
	const account = account_ ? parseAccount(account_) : void 0;
	if (account && !isAddress(account.address)) throw new InvalidAddressError({ address: account.address });
	if (to && !isAddress(to)) throw new InvalidAddressError({ address: to });
	if (maxFeePerGas && maxFeePerGas > maxUint256) throw new FeeCapTooHighError({ maxFeePerGas });
	if (maxPriorityFeePerGas && maxFeePerGas && maxPriorityFeePerGas > maxFeePerGas) throw new TipAboveFeeCapError({
		maxFeePerGas,
		maxPriorityFeePerGas
	});
}
//#endregion
//#region node_modules/viem/_esm/errors/fee.js
var BaseFeeScalarError = class extends BaseError {
	constructor() {
		super("`baseFeeMultiplier` must be greater than 1.", { name: "BaseFeeScalarError" });
	}
};
var Eip1559FeesNotSupportedError = class extends BaseError {
	constructor() {
		super("Chain does not support EIP-1559 fees.", { name: "Eip1559FeesNotSupportedError" });
	}
};
var MaxFeePerGasTooLowError = class extends BaseError {
	constructor({ maxPriorityFeePerGas }) {
		super(`\`maxFeePerGas\` cannot be less than the \`maxPriorityFeePerGas\` (${formatGwei(maxPriorityFeePerGas)} gwei).`, { name: "MaxFeePerGasTooLowError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/errors/block.js
var BlockNotFoundError = class extends BaseError {
	constructor({ blockHash, blockNumber }) {
		let identifier = "Block";
		if (blockHash) identifier = `Block at hash "${blockHash}"`;
		if (blockNumber) identifier = `Block at number "${blockNumber}"`;
		super(`${identifier} could not be found.`, { name: "BlockNotFoundError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/formatters/transaction.js
var transactionType = {
	"0x0": "legacy",
	"0x1": "eip2930",
	"0x2": "eip1559",
	"0x3": "eip4844",
	"0x4": "eip7702"
};
function formatTransaction(transaction, _) {
	const transaction_ = {
		...transaction,
		blockHash: transaction.blockHash ? transaction.blockHash : null,
		blockNumber: transaction.blockNumber ? BigInt(transaction.blockNumber) : null,
		...transaction.blockTimestamp != null && { blockTimestamp: BigInt(transaction.blockTimestamp) },
		chainId: transaction.chainId ? hexToNumber(transaction.chainId) : void 0,
		gas: transaction.gas ? BigInt(transaction.gas) : void 0,
		gasPrice: transaction.gasPrice ? BigInt(transaction.gasPrice) : void 0,
		maxFeePerBlobGas: transaction.maxFeePerBlobGas ? BigInt(transaction.maxFeePerBlobGas) : void 0,
		maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : void 0,
		maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ? BigInt(transaction.maxPriorityFeePerGas) : void 0,
		nonce: transaction.nonce ? hexToNumber(transaction.nonce) : void 0,
		to: transaction.to ? transaction.to : null,
		transactionIndex: transaction.transactionIndex ? Number(transaction.transactionIndex) : null,
		type: transaction.type ? transactionType[transaction.type] : void 0,
		typeHex: transaction.type ? transaction.type : void 0,
		value: transaction.value ? BigInt(transaction.value) : void 0,
		v: transaction.v ? BigInt(transaction.v) : void 0
	};
	if (transaction.authorizationList) transaction_.authorizationList = formatAuthorizationList(transaction.authorizationList);
	transaction_.yParity = (() => {
		if (transaction.yParity) return Number(transaction.yParity);
		if (typeof transaction_.v === "bigint") {
			if (transaction_.v === 0n || transaction_.v === 27n) return 0;
			if (transaction_.v === 1n || transaction_.v === 28n) return 1;
			if (transaction_.v >= 35n) return transaction_.v % 2n === 0n ? 1 : 0;
		}
	})();
	if (transaction_.type === "legacy") {
		delete transaction_.accessList;
		delete transaction_.maxFeePerBlobGas;
		delete transaction_.maxFeePerGas;
		delete transaction_.maxPriorityFeePerGas;
		delete transaction_.yParity;
	}
	if (transaction_.type === "eip2930") {
		delete transaction_.maxFeePerBlobGas;
		delete transaction_.maxFeePerGas;
		delete transaction_.maxPriorityFeePerGas;
	}
	if (transaction_.type === "eip1559") delete transaction_.maxFeePerBlobGas;
	return transaction_;
}
function formatAuthorizationList(authorizationList) {
	return authorizationList.map((authorization) => ({
		address: authorization.address,
		chainId: Number(authorization.chainId),
		nonce: Number(authorization.nonce),
		r: authorization.r,
		s: authorization.s,
		yParity: Number(authorization.yParity)
	}));
}
//#endregion
//#region node_modules/viem/_esm/utils/formatters/block.js
function formatBlock(block, _) {
	const transactions = (block.transactions ?? []).map((transaction) => {
		if (typeof transaction === "string") return transaction;
		return formatTransaction(transaction);
	});
	return {
		...block,
		baseFeePerGas: block.baseFeePerGas ? BigInt(block.baseFeePerGas) : null,
		blobGasUsed: block.blobGasUsed ? BigInt(block.blobGasUsed) : void 0,
		difficulty: block.difficulty ? BigInt(block.difficulty) : void 0,
		excessBlobGas: block.excessBlobGas ? BigInt(block.excessBlobGas) : void 0,
		gasLimit: block.gasLimit ? BigInt(block.gasLimit) : void 0,
		gasUsed: block.gasUsed ? BigInt(block.gasUsed) : void 0,
		hash: block.hash ? block.hash : null,
		logsBloom: block.logsBloom ? block.logsBloom : null,
		nonce: block.nonce ? block.nonce : null,
		number: block.number ? BigInt(block.number) : null,
		size: block.size ? BigInt(block.size) : void 0,
		timestamp: block.timestamp ? BigInt(block.timestamp) : void 0,
		transactions,
		totalDifficulty: block.totalDifficulty ? BigInt(block.totalDifficulty) : null
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getBlock.js
/**
* Returns information about a block at a block number, hash, or tag.
*
* - Docs: https://viem.sh/docs/actions/public/getBlock
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_fetching-blocks
* - JSON-RPC Methods:
*   - Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) for `blockNumber` & `blockTag`.
*   - Calls [`eth_getBlockByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbyhash) for `blockHash`.
*
* @param client - Client to use
* @param parameters - {@link GetBlockParameters}
* @returns Information about the block. {@link GetBlockReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getBlock } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const block = await getBlock(client)
*/
async function getBlock(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", includeTransactions: includeTransactions_ } = {}) {
	const includeTransactions = includeTransactions_ ?? false;
	const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
	let block = null;
	if (blockHash) block = await client.request({
		method: "eth_getBlockByHash",
		params: [blockHash, includeTransactions]
	}, { dedupe: true });
	else block = await client.request({
		method: "eth_getBlockByNumber",
		params: [blockNumberHex || blockTag, includeTransactions]
	}, { dedupe: Boolean(blockNumberHex) });
	if (!block) throw new BlockNotFoundError({
		blockHash,
		blockNumber
	});
	return (client.chain?.formatters?.block?.format || formatBlock)(block, "getBlock");
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getGasPrice.js
/**
* Returns the current price of gas (in wei).
*
* - Docs: https://viem.sh/docs/actions/public/getGasPrice
* - JSON-RPC Methods: [`eth_gasPrice`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gasprice)
*
* @param client - Client to use
* @returns The gas price (in wei). {@link GetGasPriceReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getGasPrice } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const gasPrice = await getGasPrice(client)
*/
async function getGasPrice(client) {
	const gasPrice = await client.request({ method: "eth_gasPrice" });
	return BigInt(gasPrice);
}
//#endregion
//#region node_modules/viem/_esm/actions/public/estimateMaxPriorityFeePerGas.js
/**
* Returns an estimate for the max priority fee per gas (in wei) for a
* transaction to be likely included in the next block.
* Defaults to [`chain.fees.defaultPriorityFee`](/docs/clients/chains#fees-defaultpriorityfee) if set.
*
* - Docs: https://viem.sh/docs/actions/public/estimateMaxPriorityFeePerGas
*
* @param client - Client to use
* @returns An estimate (in wei) for the max priority fee per gas. {@link EstimateMaxPriorityFeePerGasReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { estimateMaxPriorityFeePerGas } from 'viem/actions'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const maxPriorityFeePerGas = await estimateMaxPriorityFeePerGas(client)
* // 10000000n
*/
async function estimateMaxPriorityFeePerGas(client, args) {
	return internal_estimateMaxPriorityFeePerGas(client, args);
}
async function internal_estimateMaxPriorityFeePerGas(client, args) {
	const { block: block_, chain = client.chain, request } = args || {};
	try {
		const maxPriorityFeePerGas = chain?.fees?.maxPriorityFeePerGas ?? chain?.fees?.defaultPriorityFee;
		if (typeof maxPriorityFeePerGas === "function") {
			const maxPriorityFeePerGas_ = await maxPriorityFeePerGas({
				block: block_ || await getAction(client, getBlock, "getBlock")({}),
				client,
				request
			});
			if (maxPriorityFeePerGas_ === null) throw new Error();
			return maxPriorityFeePerGas_;
		}
		if (typeof maxPriorityFeePerGas !== "undefined") return maxPriorityFeePerGas;
		return hexToBigInt(await client.request({ method: "eth_maxPriorityFeePerGas" }));
	} catch {
		const [block, gasPrice] = await Promise.all([block_ ? Promise.resolve(block_) : getAction(client, getBlock, "getBlock")({}), getAction(client, getGasPrice, "getGasPrice")({})]);
		if (typeof block.baseFeePerGas !== "bigint") throw new Eip1559FeesNotSupportedError();
		const maxPriorityFeePerGas = gasPrice - block.baseFeePerGas;
		if (maxPriorityFeePerGas < 0n) return 0n;
		return maxPriorityFeePerGas;
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/public/estimateFeesPerGas.js
/**
* Returns an estimate for the fees per gas (in wei) for a
* transaction to be likely included in the next block.
* Defaults to [`chain.fees.estimateFeesPerGas`](/docs/clients/chains#fees-estimatefeespergas) if set.
*
* - Docs: https://viem.sh/docs/actions/public/estimateFeesPerGas
*
* @param client - Client to use
* @param parameters - {@link EstimateFeesPerGasParameters}
* @returns An estimate (in wei) for the fees per gas. {@link EstimateFeesPerGasReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { estimateFeesPerGas } from 'viem/actions'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const maxPriorityFeePerGas = await estimateFeesPerGas(client)
* // { maxFeePerGas: ..., maxPriorityFeePerGas: ... }
*/
async function estimateFeesPerGas(client, args) {
	return internal_estimateFeesPerGas(client, args);
}
async function internal_estimateFeesPerGas(client, args) {
	const { block: block_, chain = client.chain, request, type = "eip1559" } = args || {};
	const baseFeeMultiplier = await (async () => {
		if (typeof chain?.fees?.baseFeeMultiplier === "function") return chain.fees.baseFeeMultiplier({
			block: block_,
			client,
			request
		});
		return chain?.fees?.baseFeeMultiplier ?? 1.2;
	})();
	if (baseFeeMultiplier < 1) throw new BaseFeeScalarError();
	const denominator = 10 ** (baseFeeMultiplier.toString().split(".")[1]?.length ?? 0);
	const multiply = (base) => base * BigInt(Math.round(baseFeeMultiplier * denominator)) / BigInt(denominator);
	const block = block_ ? block_ : await getAction(client, getBlock, "getBlock")({});
	if (typeof chain?.fees?.estimateFeesPerGas === "function") {
		const fees = await chain.fees.estimateFeesPerGas({
			block: block_,
			client,
			multiply,
			request,
			type
		});
		if (fees !== null) return fees;
	}
	if (type === "eip1559") {
		if (typeof block.baseFeePerGas !== "bigint") throw new Eip1559FeesNotSupportedError();
		const maxPriorityFeePerGas = typeof request?.maxPriorityFeePerGas === "bigint" ? request.maxPriorityFeePerGas : await internal_estimateMaxPriorityFeePerGas(client, {
			block,
			chain,
			request
		});
		const baseFeePerGas = multiply(block.baseFeePerGas);
		return {
			maxFeePerGas: request?.maxFeePerGas ?? baseFeePerGas + maxPriorityFeePerGas,
			maxPriorityFeePerGas
		};
	}
	return { gasPrice: request?.gasPrice ?? multiply(await getAction(client, getGasPrice, "getGasPrice")({})) };
}
//#endregion
//#region node_modules/viem/_esm/utils/block/formatBlockParameter.js
/**
* Formats block parameters for RPC calls according to EIP-1898.
*
* @param parameters - Block parameters
* @returns Formatted block parameter for RPC call
*
* @example
* // Using block tag
* formatBlockParameter({ blockTag: 'latest' })
* // => 'latest'
*
* @example
* // Using block number
* formatBlockParameter({ blockNumber: 69420n })
* // => '0x10f2c'
*
* @example
* // Using block hash (EIP-1898)
* formatBlockParameter({ blockHash: '0x...' })
* // => { blockHash: '0x...' }
*
* @example
* // Using block hash with requireCanonical (EIP-1898)
* formatBlockParameter({ blockHash: '0x...', requireCanonical: true })
* // => { blockHash: '0x...', requireCanonical: true }
*/
function formatBlockParameter(parameters) {
	const { blockHash, blockNumber, blockTag, requireCanonical } = parameters;
	if (requireCanonical !== void 0 && !blockHash) throw new BaseError("`requireCanonical` can only be provided when `blockHash` is set.");
	if (blockHash) return requireCanonical ? {
		blockHash,
		requireCanonical
	} : { blockHash };
	if (typeof blockNumber === "bigint") return numberToHex(blockNumber);
	return blockTag ?? "latest";
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getTransactionCount.js
/**
* Returns the number of [Transactions](https://viem.sh/docs/glossary/terms#transaction) an Account has sent.
*
* - Docs: https://viem.sh/docs/actions/public/getTransactionCount
* - JSON-RPC Methods: [`eth_getTransactionCount`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactioncount)
*
* @param client - Client to use
* @param parameters - {@link GetTransactionCountParameters}
* @returns The number of transactions an account has sent. {@link GetTransactionCountReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getTransactionCount } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const transactionCount = await getTransactionCount(client, {
*   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
* })
*/
async function getTransactionCount(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical }) {
	const block = formatBlockParameter({
		blockHash,
		blockNumber,
		blockTag,
		requireCanonical
	});
	return hexToNumber(await client.request({
		method: "eth_getTransactionCount",
		params: [address, block]
	}, { dedupe: typeof blockNumber === "bigint" || blockHash !== void 0 }));
}
//#endregion
//#region node_modules/viem/_esm/utils/blob/blobsToCommitments.js
/**
* Compute commitments from a list of blobs.
*
* @example
* ```ts
* import { blobsToCommitments, toBlobs } from 'viem'
* import { kzg } from './kzg'
*
* const blobs = toBlobs({ data: '0x1234' })
* const commitments = blobsToCommitments({ blobs, kzg })
* ```
*/
function blobsToCommitments(parameters) {
	const { kzg } = parameters;
	const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
	const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
	const commitments = [];
	for (const blob of blobs) commitments.push(Uint8Array.from(kzg.blobToKzgCommitment(blob)));
	return to === "bytes" ? commitments : commitments.map((x) => bytesToHex(x));
}
//#endregion
//#region node_modules/viem/_esm/utils/blob/blobsToProofs.js
/**
* Compute the proofs for a list of blobs and their commitments.
*
* @example
* ```ts
* import {
*   blobsToCommitments,
*   toBlobs
* } from 'viem'
* import { kzg } from './kzg'
*
* const blobs = toBlobs({ data: '0x1234' })
* const commitments = blobsToCommitments({ blobs, kzg })
* const proofs = blobsToProofs({ blobs, commitments, kzg })
* ```
*/
function blobsToProofs(parameters) {
	const { kzg } = parameters;
	const to = parameters.to ?? (typeof parameters.blobs[0] === "string" ? "hex" : "bytes");
	const blobs = typeof parameters.blobs[0] === "string" ? parameters.blobs.map((x) => hexToBytes(x)) : parameters.blobs;
	const commitments = typeof parameters.commitments[0] === "string" ? parameters.commitments.map((x) => hexToBytes(x)) : parameters.commitments;
	const proofs = [];
	for (let i = 0; i < blobs.length; i++) {
		const blob = blobs[i];
		const commitment = commitments[i];
		proofs.push(Uint8Array.from(kzg.computeBlobKzgProof(blob, commitment)));
	}
	return to === "bytes" ? proofs : proofs.map((x) => bytesToHex(x));
}
//#endregion
//#region node_modules/viem/_esm/utils/hash/sha256.js
function sha256(value, to_) {
	const to = to_ || "hex";
	const bytes = sha256$1(isHex(value, { strict: false }) ? toBytes(value) : value);
	if (to === "bytes") return bytes;
	return toHex(bytes);
}
//#endregion
//#region node_modules/viem/_esm/utils/blob/commitmentToVersionedHash.js
/**
* Transform a commitment to it's versioned hash.
*
* @example
* ```ts
* import {
*   blobsToCommitments,
*   commitmentToVersionedHash,
*   toBlobs
* } from 'viem'
* import { kzg } from './kzg'
*
* const blobs = toBlobs({ data: '0x1234' })
* const [commitment] = blobsToCommitments({ blobs, kzg })
* const versionedHash = commitmentToVersionedHash({ commitment })
* ```
*/
function commitmentToVersionedHash(parameters) {
	const { commitment, version = 1 } = parameters;
	const to = parameters.to ?? (typeof commitment === "string" ? "hex" : "bytes");
	const versionedHash = sha256(commitment, "bytes");
	versionedHash.set([version], 0);
	return to === "bytes" ? versionedHash : bytesToHex(versionedHash);
}
//#endregion
//#region node_modules/viem/_esm/utils/blob/commitmentsToVersionedHashes.js
/**
* Transform a list of commitments to their versioned hashes.
*
* @example
* ```ts
* import {
*   blobsToCommitments,
*   commitmentsToVersionedHashes,
*   toBlobs
* } from 'viem'
* import { kzg } from './kzg'
*
* const blobs = toBlobs({ data: '0x1234' })
* const commitments = blobsToCommitments({ blobs, kzg })
* const versionedHashes = commitmentsToVersionedHashes({ commitments })
* ```
*/
function commitmentsToVersionedHashes(parameters) {
	const { commitments, version } = parameters;
	const to = parameters.to ?? (typeof commitments[0] === "string" ? "hex" : "bytes");
	const hashes = [];
	for (const commitment of commitments) hashes.push(commitmentToVersionedHash({
		commitment,
		to,
		version
	}));
	return hashes;
}
//#endregion
//#region node_modules/viem/_esm/constants/blob.js
/** Blob limit per transaction. */
var blobsPerTransaction = 6;
/** The number of field elements in a blob. */
var fieldElementsPerBlob = 4096;
/** The number of bytes in a blob. */
var bytesPerBlob = 32 * fieldElementsPerBlob;
/** Blob bytes limit per transaction. */
var maxBytesPerTransaction = bytesPerBlob * blobsPerTransaction - 1 - 1 * fieldElementsPerBlob * blobsPerTransaction;
//#endregion
//#region node_modules/viem/_esm/errors/blob.js
var BlobSizeTooLargeError = class extends BaseError {
	constructor({ maxSize, size }) {
		super("Blob size is too large.", {
			metaMessages: [`Max: ${maxSize} bytes`, `Given: ${size} bytes`],
			name: "BlobSizeTooLargeError"
		});
	}
};
var EmptyBlobError = class extends BaseError {
	constructor() {
		super("Blob data must not be empty.", { name: "EmptyBlobError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/blob/toBlobs.js
/**
* Transforms arbitrary data to blobs.
*
* @example
* ```ts
* import { toBlobs, stringToHex } from 'viem'
*
* const blobs = toBlobs({ data: stringToHex('hello world') })
* ```
*/
function toBlobs(parameters) {
	const to = parameters.to ?? (typeof parameters.data === "string" ? "hex" : "bytes");
	const data = typeof parameters.data === "string" ? hexToBytes(parameters.data) : parameters.data;
	const size_ = size$1(data);
	if (!size_) throw new EmptyBlobError();
	if (size_ > 761855) throw new BlobSizeTooLargeError({
		maxSize: maxBytesPerTransaction,
		size: size_
	});
	const blobs = [];
	let active = true;
	let position = 0;
	while (active) {
		const blob = createCursor(new Uint8Array(bytesPerBlob));
		let size = 0;
		while (size < fieldElementsPerBlob) {
			const bytes = data.slice(position, position + 31);
			blob.pushByte(0);
			blob.pushBytes(bytes);
			if (bytes.length < 31) {
				blob.pushByte(128);
				active = false;
				break;
			}
			size++;
			position += 31;
		}
		blobs.push(blob);
	}
	return to === "bytes" ? blobs.map((x) => x.bytes) : blobs.map((x) => bytesToHex(x.bytes));
}
//#endregion
//#region node_modules/viem/_esm/utils/blob/toBlobSidecars.js
/**
* Transforms arbitrary data (or blobs, commitments, & proofs) into a sidecar array.
*
* @example
* ```ts
* import { toBlobSidecars, stringToHex } from 'viem'
*
* const sidecars = toBlobSidecars({ data: stringToHex('hello world') })
* ```
*
* @example
* ```ts
* import {
*   blobsToCommitments,
*   toBlobs,
*   blobsToProofs,
*   toBlobSidecars,
*   stringToHex
* } from 'viem'
*
* const blobs = toBlobs({ data: stringToHex('hello world') })
* const commitments = blobsToCommitments({ blobs, kzg })
* const proofs = blobsToProofs({ blobs, commitments, kzg })
*
* const sidecars = toBlobSidecars({ blobs, commitments, proofs })
* ```
*/
function toBlobSidecars(parameters) {
	const { data, kzg, to } = parameters;
	const blobs = parameters.blobs ?? toBlobs({
		data,
		to
	});
	const commitments = parameters.commitments ?? blobsToCommitments({
		blobs,
		kzg,
		to
	});
	const proofs = parameters.proofs ?? blobsToProofs({
		blobs,
		commitments,
		kzg,
		to
	});
	const sidecars = [];
	for (let i = 0; i < blobs.length; i++) sidecars.push({
		blob: blobs[i],
		commitment: commitments[i],
		proof: proofs[i]
	});
	return sidecars;
}
//#endregion
//#region node_modules/viem/_esm/utils/transaction/getTransactionType.js
function getTransactionType(transaction) {
	if (transaction.type) return transaction.type;
	if (typeof transaction.authorizationList !== "undefined") return "eip7702";
	if (typeof transaction.blobs !== "undefined" || typeof transaction.blobVersionedHashes !== "undefined" || typeof transaction.maxFeePerBlobGas !== "undefined" || typeof transaction.sidecars !== "undefined") return "eip4844";
	if (typeof transaction.maxFeePerGas !== "undefined" || typeof transaction.maxPriorityFeePerGas !== "undefined") return "eip1559";
	if (typeof transaction.gasPrice !== "undefined") {
		if (typeof transaction.accessList !== "undefined") return "eip2930";
		return "legacy";
	}
	throw new InvalidSerializableTransactionError({ transaction });
}
//#endregion
//#region node_modules/viem/_esm/utils/errors/getTransactionError.js
function getTransactionError(err, { docsPath, ...args }) {
	return new TransactionExecutionError((() => {
		const cause = getNodeError(err, args);
		if (cause instanceof UnknownNodeError) return err;
		return cause;
	})(), {
		docsPath,
		...args
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getChainId.js
/**
* Returns the chain ID associated with the current network.
*
* - Docs: https://viem.sh/docs/actions/public/getChainId
* - JSON-RPC Methods: [`eth_chainId`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_chainid)
*
* @param client - Client to use
* @returns The current chain ID. {@link GetChainIdReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getChainId } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const chainId = await getChainId(client)
* // 1
*/
async function getChainId(client) {
	return hexToNumber(await client.request({ method: "eth_chainId" }, { dedupe: true }));
}
//#endregion
//#region node_modules/viem/_esm/actions/public/fillTransaction.js
/**
* Fills a transaction request with the necessary fields to be signed over.
*
* - Docs: https://viem.sh/docs/actions/public/fillTransaction
*
* @param client - Client to use
* @param parameters - {@link FillTransactionParameters}
* @returns The filled transaction. {@link FillTransactionReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { fillTransaction } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const result = await fillTransaction(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*   value: parseEther('1'),
* })
*/
async function fillTransaction(client, parameters) {
	const { account = client.account, accessList, authorizationList, chain = client.chain, blobVersionedHashes, blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce: nonce_, nonceManager, to, type, value, ...rest } = parameters;
	const nonce = await (async () => {
		if (!account) return nonce_;
		if (!nonceManager) return nonce_;
		if (typeof nonce_ !== "undefined") return nonce_;
		const account_ = parseAccount(account);
		const chainId = chain ? chain.id : await getAction(client, getChainId, "getChainId")({});
		return await nonceManager.consume({
			address: account_.address,
			chainId,
			client
		});
	})();
	assertRequest(parameters);
	const chainFormat = chain?.formatters?.transactionRequest?.format;
	const request = (chainFormat || formatTransactionRequest)({
		...extract(rest, { format: chainFormat }),
		account: account ? parseAccount(account) : void 0,
		accessList,
		authorizationList,
		blobs,
		blobVersionedHashes,
		data,
		gas,
		gasPrice,
		maxFeePerBlobGas,
		maxFeePerGas,
		maxPriorityFeePerGas,
		nonce,
		to,
		type,
		value
	}, "fillTransaction");
	try {
		const response = await client.request({
			method: "eth_fillTransaction",
			params: [request]
		});
		const transaction = (chain?.formatters?.transaction?.format || formatTransaction)(response.tx);
		delete transaction.blockHash;
		delete transaction.blockNumber;
		delete transaction.r;
		delete transaction.s;
		delete transaction.transactionIndex;
		delete transaction.v;
		delete transaction.yParity;
		transaction.data = transaction.input;
		const hasFeePayerSignature = typeof transaction.feePayerSignature !== "undefined" && transaction.feePayerSignature !== null;
		if (hasFeePayerSignature && typeof nonce !== "undefined" && transaction.nonce !== nonce) throw new FeePayerNonceMismatchError({
			filledNonce: transaction.nonce,
			requestedNonce: nonce
		});
		if (!hasFeePayerSignature) {
			if (transaction.gas) transaction.gas = parameters.gas ?? transaction.gas;
			if (transaction.gasPrice) transaction.gasPrice = parameters.gasPrice ?? transaction.gasPrice;
			if (transaction.maxFeePerBlobGas) transaction.maxFeePerBlobGas = parameters.maxFeePerBlobGas ?? transaction.maxFeePerBlobGas;
			if (transaction.maxFeePerGas) transaction.maxFeePerGas = parameters.maxFeePerGas ?? transaction.maxFeePerGas;
			if (transaction.maxPriorityFeePerGas) transaction.maxPriorityFeePerGas = parameters.maxPriorityFeePerGas ?? transaction.maxPriorityFeePerGas;
			if (typeof transaction.nonce !== "undefined") transaction.nonce = parameters.nonce ?? transaction.nonce;
			const feeMultiplier = await (async () => {
				if (typeof chain?.fees?.baseFeeMultiplier === "function") {
					const block = await getAction(client, getBlock, "getBlock")({});
					return chain.fees.baseFeeMultiplier({
						block,
						client,
						request: parameters
					});
				}
				return chain?.fees?.baseFeeMultiplier ?? 1.2;
			})();
			if (feeMultiplier < 1) throw new BaseFeeScalarError();
			const denominator = 10 ** (feeMultiplier.toString().split(".")[1]?.length ?? 0);
			const multiplyFee = (base) => base * BigInt(Math.round(feeMultiplier * denominator)) / BigInt(denominator);
			if (transaction.maxFeePerGas && !parameters.maxFeePerGas) transaction.maxFeePerGas = multiplyFee(transaction.maxFeePerGas);
			if (transaction.gasPrice && !parameters.gasPrice) transaction.gasPrice = multiplyFee(transaction.gasPrice);
		}
		return {
			raw: response.raw,
			transaction: {
				from: request.from,
				...transaction
			},
			...response.capabilities ? { capabilities: response.capabilities } : {}
		};
	} catch (err) {
		throw getTransactionError(err, {
			...parameters,
			chain: client.chain
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/prepareTransactionRequest.js
var defaultParameters = [
	"blobVersionedHashes",
	"chainId",
	"fees",
	"gas",
	"nonce",
	"type"
];
/** @internal */
var eip1559NetworkCache = /*#__PURE__*/ new Map();
/** @internal */
var supportsFillTransaction = /*#__PURE__*/ new LruMap(128);
/**
* Prepares a transaction request for signing.
*
* - Docs: https://viem.sh/docs/actions/wallet/prepareTransactionRequest
*
* @param args - {@link PrepareTransactionRequestParameters}
* @returns The transaction request. {@link PrepareTransactionRequestReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { prepareTransactionRequest } from 'viem/actions'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const request = await prepareTransactionRequest(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   to: '0x0000000000000000000000000000000000000000',
*   value: 1n,
* })
*
* @example
* // Account Hoisting
* import { createWalletClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { prepareTransactionRequest } from 'viem/actions'
*
* const client = createWalletClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const request = await prepareTransactionRequest(client, {
*   to: '0x0000000000000000000000000000000000000000',
*   value: 1n,
* })
*/
async function prepareTransactionRequest(client, args) {
	let request = args;
	request.account ??= client.account;
	request.parameters ??= defaultParameters;
	const { account: account_, chain = client.chain, nonceManager, parameters } = request;
	const prepareTransactionRequest = (() => {
		if (typeof chain?.prepareTransactionRequest === "function") return {
			fn: chain.prepareTransactionRequest,
			runAt: ["beforeFillTransaction"]
		};
		if (Array.isArray(chain?.prepareTransactionRequest)) return {
			fn: chain.prepareTransactionRequest[0],
			runAt: chain.prepareTransactionRequest[1].runAt
		};
	})();
	let chainId;
	async function getChainId$1() {
		if (chainId) return chainId;
		if (typeof request.chainId !== "undefined") return request.chainId;
		if (chain) return chain.id;
		chainId = await getAction(client, getChainId, "getChainId")({});
		return chainId;
	}
	let account = account_ ? parseAccount(account_) : account_;
	let nonce = request.nonce;
	if (prepareTransactionRequest?.fn && prepareTransactionRequest.runAt?.includes("beforeFillTransaction")) {
		request = await prepareTransactionRequest.fn({
			...request,
			chain
		}, {
			client,
			phase: "beforeFillTransaction"
		});
		nonce ??= request.nonce;
		const sender = request.account ?? request.from;
		account = sender ? parseAccount(sender) : void 0;
	}
	if (parameters.includes("nonce") && typeof nonce === "undefined" && account && nonceManager) {
		const chainId = await getChainId$1();
		nonce = await nonceManager.consume({
			address: account.address,
			chainId,
			client
		});
	}
	const fillResult = (() => {
		if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && request.kzg && request.blobs) return false;
		if (parameters.length > 0 && "feePayer" in request && request.feePayer && !("feePayerSignature" in request && request.feePayerSignature)) return true;
		if (supportsFillTransaction.get(client.uid) === false) return false;
		if (!["fees", "gas"].some((parameter) => parameters.includes(parameter))) return false;
		if (parameters.includes("chainId") && typeof request.chainId !== "number") return true;
		if (parameters.includes("nonce") && typeof nonce !== "number") return true;
		if (parameters.includes("fees") && typeof request.gasPrice !== "bigint" && (typeof request.maxFeePerGas !== "bigint" || typeof request.maxPriorityFeePerGas !== "bigint")) return true;
		if (parameters.includes("gas") && typeof request.gas !== "bigint") return true;
		return false;
	})() ? await getAction(client, fillTransaction, "fillTransaction")({
		...request,
		nonce
	}).then((result) => {
		const { chainId, from, gas, gasPrice, nonce, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, type, ...rest } = result.transaction;
		const feeToken = "feeToken" in rest ? rest.feeToken : void 0;
		const hasFilledFeePayerSignature = "feePayerSignature" in rest && rest.feePayerSignature !== null && typeof rest.feePayerSignature !== "undefined";
		const shouldUseFilledFeeToken = typeof feeToken !== "undefined" && feeToken !== null && (!("feeToken" in request) || hasFilledFeePayerSignature);
		supportsFillTransaction.set(client.uid, true);
		return {
			...request,
			...from ? { from } : {},
			...type && !request.type ? { type } : {},
			...typeof chainId !== "undefined" ? { chainId } : {},
			...typeof gas !== "undefined" ? { gas } : {},
			...typeof gasPrice !== "undefined" ? { gasPrice } : {},
			...typeof nonce !== "undefined" ? { nonce } : {},
			...typeof maxFeePerBlobGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxFeePerBlobGas } : {},
			...typeof maxFeePerGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxFeePerGas } : {},
			...typeof maxPriorityFeePerGas !== "undefined" && request.type !== "legacy" && request.type !== "eip2930" ? { maxPriorityFeePerGas } : {},
			..."nonceKey" in rest && typeof rest.nonceKey !== "undefined" ? { nonceKey: rest.nonceKey } : {},
			..."keyAuthorization" in rest && typeof rest.keyAuthorization !== "undefined" && rest.keyAuthorization !== null && !("keyAuthorization" in request) ? { keyAuthorization: rest.keyAuthorization } : {},
			..."feePayerSignature" in rest && typeof rest.feePayerSignature !== "undefined" && rest.feePayerSignature !== null ? { feePayerSignature: rest.feePayerSignature } : {},
			...shouldUseFilledFeeToken ? { feeToken } : {},
			...result.capabilities ? { _capabilities: result.capabilities } : {}
		};
	}).catch((e) => {
		const error = e;
		if (error.name !== "TransactionExecutionError") return request;
		if (error.walk?.((error) => error instanceof FeePayerNonceMismatchError)) throw e;
		if (error.walk?.((e) => {
			return e.name === "ExecutionRevertedError";
		})) throw e;
		if (error.walk?.((e) => {
			const error = e;
			return error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError" || error.message?.includes("eth_fillTransaction is not available");
		})) supportsFillTransaction.set(client.uid, false);
		return request;
	}) : request;
	nonce ??= fillResult.nonce;
	request = {
		...fillResult,
		...account ? { from: account?.address } : {},
		...typeof nonce !== "undefined" ? { nonce } : {}
	};
	const { blobs, gas, kzg, type } = request;
	if (prepareTransactionRequest?.fn && prepareTransactionRequest.runAt?.includes("beforeFillParameters")) request = await prepareTransactionRequest.fn({
		...request,
		chain
	}, {
		client,
		phase: "beforeFillParameters"
	});
	let block;
	async function getBlock$1() {
		if (block) return block;
		block = await getAction(client, getBlock, "getBlock")({ blockTag: "latest" });
		return block;
	}
	if (parameters.includes("nonce") && typeof nonce === "undefined" && account && !nonceManager) request.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
		address: account.address,
		blockTag: "pending"
	});
	if ((parameters.includes("blobVersionedHashes") || parameters.includes("sidecars")) && blobs && kzg) {
		const commitments = blobsToCommitments({
			blobs,
			kzg
		});
		if (parameters.includes("blobVersionedHashes")) {
			const versionedHashes = commitmentsToVersionedHashes({
				commitments,
				to: "hex"
			});
			request.blobVersionedHashes = versionedHashes;
		}
		if (parameters.includes("sidecars")) {
			const sidecars = toBlobSidecars({
				blobs,
				commitments,
				proofs: blobsToProofs({
					blobs,
					commitments,
					kzg
				}),
				to: "hex"
			});
			request.sidecars = sidecars;
		}
	}
	if (parameters.includes("chainId")) request.chainId = await getChainId$1();
	if ((parameters.includes("fees") || parameters.includes("type")) && typeof type === "undefined") try {
		request.type = getTransactionType(request);
	} catch {
		let isEip1559Network = eip1559NetworkCache.get(client.uid);
		if (typeof isEip1559Network === "undefined") {
			isEip1559Network = typeof (await getBlock$1())?.baseFeePerGas === "bigint";
			eip1559NetworkCache.set(client.uid, isEip1559Network);
		}
		request.type = isEip1559Network ? "eip1559" : "legacy";
	}
	if (parameters.includes("fees")) {
		if (request.type !== "legacy" && request.type !== "eip2930") {
			if (typeof request.maxFeePerGas === "undefined" || typeof request.maxPriorityFeePerGas === "undefined") {
				const { maxFeePerGas, maxPriorityFeePerGas } = await internal_estimateFeesPerGas(client, {
					block: await getBlock$1(),
					chain,
					request
				});
				if (typeof request.maxPriorityFeePerGas === "undefined" && request.maxFeePerGas && request.maxFeePerGas < maxPriorityFeePerGas) throw new MaxFeePerGasTooLowError({ maxPriorityFeePerGas });
				request.maxPriorityFeePerGas = maxPriorityFeePerGas;
				request.maxFeePerGas = maxFeePerGas;
			}
		} else {
			if (typeof request.maxFeePerGas !== "undefined" || typeof request.maxPriorityFeePerGas !== "undefined") throw new Eip1559FeesNotSupportedError();
			if (typeof request.gasPrice === "undefined") {
				const { gasPrice: gasPrice_ } = await internal_estimateFeesPerGas(client, {
					block: await getBlock$1(),
					chain,
					request,
					type: "legacy"
				});
				request.gasPrice = gasPrice_;
			}
		}
	}
	if (parameters.includes("gas") && typeof gas === "undefined") request.gas = await getAction(client, estimateGas, "estimateGas")({
		...request,
		account,
		prepare: account?.type === "local" ? [] : ["blobVersionedHashes"]
	});
	if (prepareTransactionRequest?.fn && prepareTransactionRequest.runAt?.includes("afterFillParameters")) request = await prepareTransactionRequest.fn({
		...request,
		chain
	}, {
		client,
		phase: "afterFillParameters"
	});
	assertRequest(request);
	delete request.parameters;
	return request;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/estimateGas.js
/**
* Estimates the gas necessary to complete a transaction without submitting it to the network.
*
* - Docs: https://viem.sh/docs/actions/public/estimateGas
* - JSON-RPC Methods: [`eth_estimateGas`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_estimategas)
*
* @param client - Client to use
* @param parameters - {@link EstimateGasParameters}
* @returns The gas estimate (in gas units). {@link EstimateGasReturnType}
*
* @example
* import { createPublicClient, http, parseEther } from 'viem'
* import { mainnet } from 'viem/chains'
* import { estimateGas } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const gasEstimate = await estimateGas(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*   value: parseEther('1'),
* })
*/
async function estimateGas(client, args) {
	const { account: account_ = client.account, prepare = true } = args;
	const account = account_ ? parseAccount(account_) : void 0;
	const parameters = (() => {
		if (Array.isArray(prepare)) return prepare;
		if (account?.type !== "local") return ["blobVersionedHashes"];
	})();
	try {
		const to = await (async () => {
			if (args.to) return args.to;
			if (args.authorizationList && args.authorizationList.length > 0) return await recoverAuthorizationAddress({ authorization: args.authorizationList[0] }).catch(() => {
				throw new BaseError("`to` is required. Could not infer from `authorizationList`");
			});
		})();
		const { accessList, authorizationList, blobs, blobVersionedHashes, blockNumber, blockTag, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, value, stateOverride, ...rest } = prepare ? await prepareTransactionRequest(client, {
			...args,
			parameters,
			to
		}) : args;
		if (gas && args.gas !== gas) return gas;
		const block = (typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0) || blockTag;
		const rpcStateOverride = serializeStateOverride(stateOverride);
		assertRequest(args);
		const chainFormat = client.chain?.formatters?.transactionRequest?.format;
		const request = (chainFormat || formatTransactionRequest)({
			...extract(rest, { format: chainFormat }),
			account,
			accessList,
			authorizationList,
			blobs,
			blobVersionedHashes,
			data,
			gasPrice,
			maxFeePerBlobGas,
			maxFeePerGas,
			maxPriorityFeePerGas,
			nonce,
			to,
			value
		}, "estimateGas");
		return BigInt(await client.request({
			method: "eth_estimateGas",
			params: rpcStateOverride ? [
				request,
				block ?? client.experimental_blockTag ?? "latest",
				rpcStateOverride
			] : block ? [request, block] : [request]
		}));
	} catch (err) {
		throw getEstimateGasError(err, {
			...args,
			account,
			chain: client.chain
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/public/estimateContractGas.js
/**
* Estimates the gas required to successfully execute a contract write function call.
*
* - Docs: https://viem.sh/docs/contract/estimateContractGas
*
* Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`estimateGas` action](https://viem.sh/docs/actions/public/estimateGas) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
*
* @param client - Client to use
* @param parameters - {@link EstimateContractGasParameters}
* @returns The gas estimate (in wei). {@link EstimateContractGasReturnType}
*
* @example
* import { createPublicClient, http, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { estimateContractGas } from 'viem/contract'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const gas = await estimateContractGas(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*   abi: parseAbi(['function mint() public']),
*   functionName: 'mint',
*   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
* })
*/
async function estimateContractGas(client, parameters) {
	const { abi, address, args, functionName, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, ...request } = parameters;
	const data = encodeFunctionData({
		abi,
		args,
		functionName
	});
	try {
		return await getAction(client, estimateGas, "estimateGas")({
			data: `${data}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
			to: address,
			...request
		});
	} catch (error) {
		throw getContractError(error, {
			abi,
			address,
			args,
			docsPath: "/docs/contract/estimateContractGas",
			functionName,
			sender: (request.account ? parseAccount(request.account) : void 0)?.address
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/utils/address/isAddressEqual.js
function isAddressEqual(a, b) {
	if (!isAddress(a, { strict: false })) throw new InvalidAddressError({ address: a });
	if (!isAddress(b, { strict: false })) throw new InvalidAddressError({ address: b });
	return a.toLowerCase() === b.toLowerCase();
}
//#endregion
//#region node_modules/viem/_esm/utils/formatters/log.js
function formatLog(log, { args, eventName } = {}) {
	return {
		...log,
		blockHash: log.blockHash ? log.blockHash : null,
		blockNumber: log.blockNumber ? BigInt(log.blockNumber) : null,
		blockTimestamp: log.blockTimestamp ? BigInt(log.blockTimestamp) : log.blockTimestamp === null ? null : void 0,
		logIndex: log.logIndex ? Number(log.logIndex) : null,
		transactionHash: log.transactionHash ? log.transactionHash : null,
		transactionIndex: log.transactionIndex ? Number(log.transactionIndex) : null,
		...eventName ? {
			args,
			eventName
		} : {}
	};
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/decodeEventLog.js
var docsPath$4 = "/docs/contract/decodeEventLog";
function decodeEventLog(parameters) {
	const { abi, data, strict: strict_, topics } = parameters;
	const strict = strict_ ?? true;
	const [signature, ...argTopics] = topics;
	if (!signature) throw new AbiEventSignatureEmptyTopicsError({ docsPath: docsPath$4 });
	const abiItem = abi.find((x) => x.type === "event" && signature === toEventSelector(formatAbiItem(x)));
	if (!(abiItem && "name" in abiItem) || abiItem.type !== "event") throw new AbiEventSignatureNotFoundError(signature, { docsPath: docsPath$4 });
	const { name, inputs } = abiItem;
	const isUnnamed = inputs?.some((x) => !("name" in x && x.name));
	const args = isUnnamed ? [] : {};
	const indexedInputs = inputs.map((x, i) => [x, i]).filter(([x]) => "indexed" in x && x.indexed);
	const missingIndexedInputs = [];
	for (let i = 0; i < indexedInputs.length; i++) {
		const [param, argIndex] = indexedInputs[i];
		const topic = argTopics[i];
		if (!topic) {
			if (strict) throw new DecodeLogTopicsMismatch({
				abiItem,
				param
			});
			missingIndexedInputs.push([param, argIndex]);
			continue;
		}
		args[isUnnamed ? argIndex : param.name || argIndex] = decodeTopic({
			param,
			value: topic
		});
	}
	const nonIndexedInputs = inputs.filter((x) => !("indexed" in x && x.indexed));
	const inputsToDecode = strict ? nonIndexedInputs : [...missingIndexedInputs.map(([param]) => param), ...nonIndexedInputs];
	if (inputsToDecode.length > 0) {
		if (data && data !== "0x") try {
			const decodedData = decodeAbiParameters(inputsToDecode, data);
			if (decodedData) {
				let dataIndex = 0;
				if (!strict) for (const [param, argIndex] of missingIndexedInputs) args[isUnnamed ? argIndex : param.name || argIndex] = decodedData[dataIndex++];
				if (isUnnamed) {
					for (let i = 0; i < inputs.length; i++) if (args[i] === void 0 && dataIndex < decodedData.length) args[i] = decodedData[dataIndex++];
				} else for (let i = 0; i < nonIndexedInputs.length; i++) args[nonIndexedInputs[i].name] = decodedData[dataIndex++];
			}
		} catch (err) {
			if (strict) {
				if (err instanceof AbiDecodingDataSizeTooSmallError || err instanceof PositionOutOfBoundsError) throw new DecodeLogDataMismatch({
					abiItem,
					data,
					params: inputsToDecode,
					size: size$1(data)
				});
				throw err;
			}
		}
		else if (strict) throw new DecodeLogDataMismatch({
			abiItem,
			data: "0x",
			params: inputsToDecode,
			size: 0
		});
	}
	return {
		eventName: name,
		args: Object.values(args).length > 0 ? args : void 0
	};
}
function decodeTopic({ param, value }) {
	if (param.type === "string" || param.type === "bytes" || param.type === "tuple" || param.type.match(/^(.*)\[(\d+)?\]$/)) return value;
	return (decodeAbiParameters([param], value) || [])[0];
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/parseEventLogs.js
/**
* Extracts & decodes logs matching the provided signature(s) (`abi` + optional `eventName`)
* from a set of opaque logs.
*
* @param parameters - {@link ParseEventLogsParameters}
* @returns The logs. {@link ParseEventLogsReturnType}
*
* @example
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { parseEventLogs } from 'viem/op-stack'
*
* const client = createClient({
*   chain: mainnet,
*   transport: http(),
* })
*
* const receipt = await getTransactionReceipt(client, {
*   hash: '0xec23b2ba4bc59ba61554507c1b1bc91649e6586eb2dd00c728e8ed0db8bb37ea',
* })
*
* const logs = parseEventLogs({ logs: receipt.logs })
* // [{ args: { ... }, eventName: 'TransactionDeposited', ... }, ...]
*/
function parseEventLogs(parameters) {
	const { abi, args, logs, strict = true } = parameters;
	const eventName = (() => {
		if (!parameters.eventName) return void 0;
		if (Array.isArray(parameters.eventName)) return parameters.eventName;
		return [parameters.eventName];
	})();
	const abiTopics = abi.filter((abiItem) => abiItem.type === "event").map((abiItem) => ({
		abi: abiItem,
		selector: toEventSelector(abiItem)
	}));
	return logs.map((log) => {
		const formattedLog = typeof log.blockNumber === "string" ? formatLog(log) : log;
		const abiItems = abiTopics.filter((abiTopic) => formattedLog.topics[0] === abiTopic.selector);
		if (abiItems.length === 0) return null;
		let event;
		let abiItem;
		for (const item of abiItems) try {
			event = decodeEventLog({
				...formattedLog,
				abi: [item.abi],
				strict: true
			});
			abiItem = item;
			break;
		} catch {}
		if (!event && !strict) {
			abiItem = abiItems[0];
			try {
				event = decodeEventLog({
					data: formattedLog.data,
					topics: formattedLog.topics,
					abi: [abiItem.abi],
					strict: false
				});
			} catch {
				const isUnnamed = abiItem.abi.inputs?.some((x) => !("name" in x && x.name));
				return {
					...formattedLog,
					args: isUnnamed ? [] : {},
					eventName: abiItem.abi.name
				};
			}
		}
		if (!event || !abiItem) return null;
		if (eventName && !eventName.includes(event.eventName)) return null;
		if (!includesArgs({
			args: event.args,
			inputs: abiItem.abi.inputs,
			matchArgs: args
		})) return null;
		return {
			...event,
			...formattedLog
		};
	}).filter(Boolean);
}
function includesArgs(parameters) {
	const { args, inputs, matchArgs } = parameters;
	if (!matchArgs) return true;
	if (!args) return false;
	function isEqual(input, value, arg) {
		try {
			if (input.type === "address") return isAddressEqual(value, arg);
			if (input.type === "string" || input.type === "bytes") return keccak256(toBytes(value)) === arg;
			return value === arg;
		} catch {
			return false;
		}
	}
	if (Array.isArray(args) && Array.isArray(matchArgs)) return matchArgs.every((value, index) => {
		if (value === null || value === void 0) return true;
		const input = inputs[index];
		if (!input) return false;
		return (Array.isArray(value) ? value : [value]).some((value) => isEqual(input, value, args[index]));
	});
	if (typeof args === "object" && !Array.isArray(args) && typeof matchArgs === "object" && !Array.isArray(matchArgs)) return Object.entries(matchArgs).every(([key, value]) => {
		if (value === null || value === void 0) return true;
		const input = inputs.find((input) => input.name === key);
		if (!input) return false;
		return (Array.isArray(value) ? value : [value]).some((value) => isEqual(input, value, args[key]));
	});
	return false;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getLogs.js
/**
* Returns a list of event logs matching the provided parameters.
*
* - Docs: https://viem.sh/docs/actions/public/getLogs
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/logs_event-logs
* - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
*
* @param client - Client to use
* @param parameters - {@link GetLogsParameters}
* @returns A list of event logs. {@link GetLogsReturnType}
*
* @example
* import { createPublicClient, http, parseAbiItem } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getLogs } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const logs = await getLogs(client)
*/
async function getLogs(client, { address, blockHash, fromBlock, toBlock, event, events: events_, args, strict: strict_ } = {}) {
	const strict = strict_ ?? false;
	const events = events_ ?? (event ? [event] : void 0);
	let topics = [];
	if (events) {
		topics = [events.flatMap((event) => encodeEventTopics({
			abi: [event],
			eventName: event.name,
			args: events_ ? void 0 : args
		}))];
		if (event) topics = topics[0];
	}
	let logs;
	if (blockHash) logs = await client.request({
		method: "eth_getLogs",
		params: [{
			address,
			topics,
			blockHash
		}]
	});
	else logs = await client.request({
		method: "eth_getLogs",
		params: [{
			address,
			topics,
			fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
			toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock
		}]
	});
	const formattedLogs = logs.map((log) => formatLog(log));
	if (!events) return formattedLogs;
	return parseEventLogs({
		abi: events,
		args,
		logs: formattedLogs,
		strict
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getContractEvents.js
/**
* Returns a list of event logs emitted by a contract.
*
* - Docs: https://viem.sh/docs/contract/getContractEvents#getcontractevents
* - JSON-RPC Methods: [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs)
*
* @param client - Client to use
* @param parameters - {@link GetContractEventsParameters}
* @returns A list of event logs. {@link GetContractEventsReturnType}
*
* @example
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getContractEvents } from 'viem/public'
* import { wagmiAbi } from './abi'
*
* const client = createClient({
*   chain: mainnet,
*   transport: http(),
* })
* const logs = await getContractEvents(client, {
*  address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*  abi: wagmiAbi,
*  eventName: 'Transfer'
* })
*/
async function getContractEvents(client, parameters) {
	const { abi, address, args, blockHash, eventName, fromBlock, toBlock, strict } = parameters;
	const event = eventName ? getAbiItem({
		abi,
		name: eventName
	}) : void 0;
	const events = !event ? abi.filter((x) => x.type === "event") : void 0;
	return getAction(client, getLogs, "getLogs")({
		address,
		args,
		blockHash,
		event,
		events,
		fromBlock,
		toBlock,
		strict
	});
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/decodeFunctionResult.js
var docsPath$3 = "/docs/contract/decodeFunctionResult";
function decodeFunctionResult(parameters) {
	const { abi, args, functionName, data } = parameters;
	let abiItem = abi[0];
	if (functionName) {
		const item = getAbiItem({
			abi,
			args,
			name: functionName
		});
		if (!item) throw new AbiFunctionNotFoundError(functionName, { docsPath: docsPath$3 });
		abiItem = item;
	}
	if (abiItem.type !== "function") throw new AbiFunctionNotFoundError(void 0, { docsPath: docsPath$3 });
	if (!abiItem.outputs) throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath: docsPath$3 });
	const values = decodeAbiParameters(abiItem.outputs, data);
	if (values && values.length > 1) return values;
	if (values && values.length === 1) return values[0];
}
//#endregion
//#region node_modules/viem/_esm/constants/abis.js
var multicall3Abi = [
	{
		inputs: [{
			components: [
				{
					name: "target",
					type: "address"
				},
				{
					name: "allowFailure",
					type: "bool"
				},
				{
					name: "callData",
					type: "bytes"
				}
			],
			name: "calls",
			type: "tuple[]"
		}],
		name: "aggregate3",
		outputs: [{
			components: [{
				name: "success",
				type: "bool"
			}, {
				name: "returnData",
				type: "bytes"
			}],
			name: "returnData",
			type: "tuple[]"
		}],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [{
			name: "addr",
			type: "address"
		}],
		name: "getEthBalance",
		outputs: [{
			name: "balance",
			type: "uint256"
		}],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [],
		name: "getCurrentBlockTimestamp",
		outputs: [{
			internalType: "uint256",
			name: "timestamp",
			type: "uint256"
		}],
		stateMutability: "view",
		type: "function"
	}
];
var batchGatewayAbi = [{
	name: "query",
	type: "function",
	stateMutability: "view",
	inputs: [{
		type: "tuple[]",
		name: "queries",
		components: [
			{
				type: "address",
				name: "sender"
			},
			{
				type: "string[]",
				name: "urls"
			},
			{
				type: "bytes",
				name: "data"
			}
		]
	}],
	outputs: [{
		type: "bool[]",
		name: "failures"
	}, {
		type: "bytes[]",
		name: "responses"
	}]
}, {
	name: "HttpError",
	type: "error",
	inputs: [{
		type: "uint16",
		name: "status"
	}, {
		type: "string",
		name: "message"
	}]
}];
var universalResolverErrors = [
	{
		inputs: [{
			name: "dns",
			type: "bytes"
		}],
		name: "DNSDecodingFailed",
		type: "error"
	},
	{
		inputs: [{
			name: "ens",
			type: "string"
		}],
		name: "DNSEncodingFailed",
		type: "error"
	},
	{
		inputs: [],
		name: "EmptyAddress",
		type: "error"
	},
	{
		inputs: [{
			name: "status",
			type: "uint16"
		}, {
			name: "message",
			type: "string"
		}],
		name: "HttpError",
		type: "error"
	},
	{
		inputs: [],
		name: "InvalidBatchGatewayResponse",
		type: "error"
	},
	{
		inputs: [{
			name: "errorData",
			type: "bytes"
		}],
		name: "ResolverError",
		type: "error"
	},
	{
		inputs: [{
			name: "name",
			type: "bytes"
		}, {
			name: "resolver",
			type: "address"
		}],
		name: "ResolverNotContract",
		type: "error"
	},
	{
		inputs: [{
			name: "name",
			type: "bytes"
		}],
		name: "ResolverNotFound",
		type: "error"
	},
	{
		inputs: [{
			name: "primary",
			type: "string"
		}, {
			name: "primaryAddress",
			type: "bytes"
		}],
		name: "ReverseAddressMismatch",
		type: "error"
	},
	{
		inputs: [{
			internalType: "bytes4",
			name: "selector",
			type: "bytes4"
		}],
		name: "UnsupportedResolverProfile",
		type: "error"
	}
];
var universalResolverResolveAbi = [...universalResolverErrors, {
	name: "resolveWithGateways",
	type: "function",
	stateMutability: "view",
	inputs: [
		{
			name: "name",
			type: "bytes"
		},
		{
			name: "data",
			type: "bytes"
		},
		{
			name: "gateways",
			type: "string[]"
		}
	],
	outputs: [{
		name: "",
		type: "bytes"
	}, {
		name: "address",
		type: "address"
	}]
}];
var universalResolverReverseAbi = [...universalResolverErrors, {
	name: "reverseWithGateways",
	type: "function",
	stateMutability: "view",
	inputs: [
		{
			type: "bytes",
			name: "reverseName"
		},
		{
			type: "uint256",
			name: "coinType"
		},
		{
			type: "string[]",
			name: "gateways"
		}
	],
	outputs: [
		{
			type: "string",
			name: "resolvedName"
		},
		{
			type: "address",
			name: "resolver"
		},
		{
			type: "address",
			name: "reverseResolver"
		}
	]
}];
var textResolverAbi = [{
	name: "text",
	type: "function",
	stateMutability: "view",
	inputs: [{
		name: "name",
		type: "bytes32"
	}, {
		name: "key",
		type: "string"
	}],
	outputs: [{
		name: "",
		type: "string"
	}]
}];
var addressResolverAbi = [{
	name: "addr",
	type: "function",
	stateMutability: "view",
	inputs: [{
		name: "name",
		type: "bytes32"
	}],
	outputs: [{
		name: "",
		type: "address"
	}]
}, {
	name: "addr",
	type: "function",
	stateMutability: "view",
	inputs: [{
		name: "name",
		type: "bytes32"
	}, {
		name: "coinType",
		type: "uint256"
	}],
	outputs: [{
		name: "",
		type: "bytes"
	}]
}];
/** @internal */
var erc1271Abi = [{
	name: "isValidSignature",
	type: "function",
	stateMutability: "view",
	inputs: [{
		name: "hash",
		type: "bytes32"
	}, {
		name: "signature",
		type: "bytes"
	}],
	outputs: [{
		name: "",
		type: "bytes4"
	}]
}];
var erc6492SignatureValidatorAbi = [{
	inputs: [
		{
			name: "_signer",
			type: "address"
		},
		{
			name: "_hash",
			type: "bytes32"
		},
		{
			name: "_signature",
			type: "bytes"
		}
	],
	stateMutability: "nonpayable",
	type: "constructor"
}, {
	inputs: [
		{
			name: "_signer",
			type: "address"
		},
		{
			name: "_hash",
			type: "bytes32"
		},
		{
			name: "_signature",
			type: "bytes"
		}
	],
	outputs: [{ type: "bool" }],
	stateMutability: "nonpayable",
	type: "function",
	name: "isValidSig"
}];
/** [ERC-20 Token Standard](https://ethereum.org/en/developers/docs/standards/tokens/erc-20) */
var erc20Abi = [
	{
		type: "event",
		name: "Approval",
		inputs: [
			{
				indexed: true,
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				name: "value",
				type: "uint256"
			}
		]
	},
	{
		type: "event",
		name: "Transfer",
		inputs: [
			{
				indexed: true,
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				name: "value",
				type: "uint256"
			}
		]
	},
	{
		type: "function",
		name: "allowance",
		stateMutability: "view",
		inputs: [{
			name: "owner",
			type: "address"
		}, {
			name: "spender",
			type: "address"
		}],
		outputs: [{ type: "uint256" }]
	},
	{
		type: "function",
		name: "approve",
		stateMutability: "nonpayable",
		inputs: [{
			name: "spender",
			type: "address"
		}, {
			name: "amount",
			type: "uint256"
		}],
		outputs: [{ type: "bool" }]
	},
	{
		type: "function",
		name: "balanceOf",
		stateMutability: "view",
		inputs: [{
			name: "account",
			type: "address"
		}],
		outputs: [{ type: "uint256" }]
	},
	{
		type: "function",
		name: "decimals",
		stateMutability: "view",
		inputs: [],
		outputs: [{ type: "uint8" }]
	},
	{
		type: "function",
		name: "name",
		stateMutability: "view",
		inputs: [],
		outputs: [{ type: "string" }]
	},
	{
		type: "function",
		name: "symbol",
		stateMutability: "view",
		inputs: [],
		outputs: [{ type: "string" }]
	},
	{
		type: "function",
		name: "totalSupply",
		stateMutability: "view",
		inputs: [],
		outputs: [{ type: "uint256" }]
	},
	{
		type: "function",
		name: "transfer",
		stateMutability: "nonpayable",
		inputs: [{
			name: "recipient",
			type: "address"
		}, {
			name: "amount",
			type: "uint256"
		}],
		outputs: [{ type: "bool" }]
	},
	{
		type: "function",
		name: "transferFrom",
		stateMutability: "nonpayable",
		inputs: [
			{
				name: "sender",
				type: "address"
			},
			{
				name: "recipient",
				type: "address"
			},
			{
				name: "amount",
				type: "uint256"
			}
		],
		outputs: [{ type: "bool" }]
	}
];
//#endregion
//#region node_modules/viem/_esm/constants/contracts.js
var deploylessCallViaBytecodeBytecode = "0x608060405234801561001057600080fd5b5060405161018e38038061018e83398101604081905261002f91610124565b6000808351602085016000f59050803b61004857600080fd5b6000808351602085016000855af16040513d6000823e81610067573d81fd5b3d81f35b634e487b7160e01b600052604160045260246000fd5b600082601f83011261009257600080fd5b81516001600160401b038111156100ab576100ab61006b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156100d9576100d961006b565b6040528181528382016020018510156100f157600080fd5b60005b82811015610110576020818601810151838301820152016100f4565b506000918101602001919091529392505050565b6000806040838503121561013757600080fd5b82516001600160401b0381111561014d57600080fd5b61015985828601610081565b602085015190935090506001600160401b0381111561017757600080fd5b61018385828601610081565b915050925092905056fe";
var deploylessCallViaFactoryBytecode = "0x608060405234801561001057600080fd5b506040516102c03803806102c083398101604081905261002f916101e6565b836001600160a01b03163b6000036100e457600080836001600160a01b03168360405161005c9190610270565b6000604051808303816000865af19150503d8060008114610099576040519150601f19603f3d011682016040523d82523d6000602084013e61009e565b606091505b50915091508115806100b857506001600160a01b0386163b155b156100e1578060405163101bb98d60e01b81526004016100d8919061028c565b60405180910390fd5b50505b6000808451602086016000885af16040513d6000823e81610103573d81fd5b3d81f35b80516001600160a01b038116811461011e57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561015457818101518382015260200161013c565b50506000910152565b600082601f83011261016e57600080fd5b81516001600160401b0381111561018757610187610123565b604051601f8201601f19908116603f011681016001600160401b03811182821017156101b5576101b5610123565b6040528181528382016020018510156101cd57600080fd5b6101de826020830160208701610139565b949350505050565b600080600080608085870312156101fc57600080fd5b61020585610107565b60208601519094506001600160401b0381111561022157600080fd5b61022d8782880161015d565b93505061023c60408601610107565b60608601519092506001600160401b0381111561025857600080fd5b6102648782880161015d565b91505092959194509250565b60008251610282818460208701610139565b9190910192915050565b60208152600082518060208401526102ab816040850160208701610139565b601f01601f1916919091016040019291505056fe";
var erc6492SignatureValidatorByteCode = "0x608060405234801561001057600080fd5b5060405161069438038061069483398101604081905261002f9161051e565b600061003c848484610048565b9050806000526001601ff35b60007f64926492649264926492649264926492649264926492649264926492649264926100748361040c565b036101e7576000606080848060200190518101906100929190610577565b60405192955090935091506000906001600160a01b038516906100b69085906105dd565b6000604051808303816000865af19150503d80600081146100f3576040519150601f19603f3d011682016040523d82523d6000602084013e6100f8565b606091505b50509050876001600160a01b03163b60000361016057806101605760405162461bcd60e51b815260206004820152601e60248201527f5369676e617475726556616c696461746f723a206465706c6f796d656e74000060448201526064015b60405180910390fd5b604051630b135d3f60e11b808252906001600160a01b038a1690631626ba7e90610190908b9087906004016105f9565b602060405180830381865afa1580156101ad573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906101d19190610633565b6001600160e01b03191614945050505050610405565b6001600160a01b0384163b1561027a57604051630b135d3f60e11b808252906001600160a01b03861690631626ba7e9061022790879087906004016105f9565b602060405180830381865afa158015610244573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102689190610633565b6001600160e01b031916149050610405565b81516041146102df5760405162461bcd60e51b815260206004820152603a602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e6174757265206c656e6774680000000000006064820152608401610157565b6102e7610425565b5060208201516040808401518451859392600091859190811061030c5761030c61065d565b016020015160f81c9050601b811480159061032b57508060ff16601c14155b1561038c5760405162461bcd60e51b815260206004820152603b602482015260008051602061067483398151915260448201527f3a20696e76616c6964207369676e617475726520762076616c756500000000006064820152608401610157565b60408051600081526020810180835289905260ff83169181019190915260608101849052608081018390526001600160a01b0389169060019060a0016020604051602081039080840390855afa1580156103ea573d6000803e3d6000fd5b505050602060405103516001600160a01b0316149450505050505b9392505050565b600060208251101561041d57600080fd5b508051015190565b60405180606001604052806003906020820280368337509192915050565b6001600160a01b038116811461045857600080fd5b50565b634e487b7160e01b600052604160045260246000fd5b60005b8381101561048c578181015183820152602001610474565b50506000910152565b600082601f8301126104a657600080fd5b81516001600160401b038111156104bf576104bf61045b565b604051601f8201601f19908116603f011681016001600160401b03811182821017156104ed576104ed61045b565b60405281815283820160200185101561050557600080fd5b610516826020830160208701610471565b949350505050565b60008060006060848603121561053357600080fd5b835161053e81610443565b6020850151604086015191945092506001600160401b0381111561056157600080fd5b61056d86828701610495565b9150509250925092565b60008060006060848603121561058c57600080fd5b835161059781610443565b60208501519093506001600160401b038111156105b357600080fd5b6105bf86828701610495565b604086015190935090506001600160401b0381111561056157600080fd5b600082516105ef818460208701610471565b9190910192915050565b828152604060208201526000825180604084015261061e816060850160208701610471565b601f01601f1916919091016060019392505050565b60006020828403121561064557600080fd5b81516001600160e01b03198116811461040557600080fd5b634e487b7160e01b600052603260045260246000fdfe5369676e617475726556616c696461746f72237265636f7665725369676e6572";
var multicall3Bytecode = "0x608060405234801561001057600080fd5b506115b9806100206000396000f3fe6080604052600436106100f35760003560e01c80634d2301cc1161008a578063a8b0574e11610059578063a8b0574e14610325578063bce38bd714610350578063c3077fa914610380578063ee82ac5e146103b2576100f3565b80634d2301cc1461026257806372425d9d1461029f57806382ad56cb146102ca57806386d516e8146102fa576100f3565b80633408e470116100c65780633408e470146101af578063399542e9146101da5780633e64a6961461020c57806342cbb15c14610237576100f3565b80630f28c97d146100f8578063174dea7114610123578063252dba421461015357806327e86d6e14610184575b600080fd5b34801561010457600080fd5b5061010d6103ef565b60405161011a9190610c0a565b60405180910390f35b61013d60048036038101906101389190610c94565b6103f7565b60405161014a9190610e94565b60405180910390f35b61016d60048036038101906101689190610f0c565b610615565b60405161017b92919061101b565b60405180910390f35b34801561019057600080fd5b506101996107ab565b6040516101a69190611064565b60405180910390f35b3480156101bb57600080fd5b506101c46107b7565b6040516101d19190610c0a565b60405180910390f35b6101f460048036038101906101ef91906110ab565b6107bf565b6040516102039392919061110b565b60405180910390f35b34801561021857600080fd5b506102216107e1565b60405161022e9190610c0a565b60405180910390f35b34801561024357600080fd5b5061024c6107e9565b6040516102599190610c0a565b60405180910390f35b34801561026e57600080fd5b50610289600480360381019061028491906111a7565b6107f1565b6040516102969190610c0a565b60405180910390f35b3480156102ab57600080fd5b506102b4610812565b6040516102c19190610c0a565b60405180910390f35b6102e460048036038101906102df919061122a565b61081a565b6040516102f19190610e94565b60405180910390f35b34801561030657600080fd5b5061030f6109e4565b60405161031c9190610c0a565b60405180910390f35b34801561033157600080fd5b5061033a6109ec565b6040516103479190611286565b60405180910390f35b61036a600480360381019061036591906110ab565b6109f4565b6040516103779190610e94565b60405180910390f35b61039a60048036038101906103959190610f0c565b610ba6565b6040516103a99392919061110b565b60405180910390f35b3480156103be57600080fd5b506103d960048036038101906103d491906112cd565b610bca565b6040516103e69190611064565b60405180910390f35b600042905090565b60606000808484905090508067ffffffffffffffff81111561041c5761041b6112fa565b5b60405190808252806020026020018201604052801561045557816020015b610442610bd5565b81526020019060019003908161043a5790505b5092503660005b828110156105c957600085828151811061047957610478611329565b5b6020026020010151905087878381811061049657610495611329565b5b90506020028101906104a89190611367565b925060008360400135905080860195508360000160208101906104cb91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16818580606001906104f2919061138f565b604051610500929190611431565b60006040518083038185875af1925050503d806000811461053d576040519150601f19603f3d011682016040523d82523d6000602084013e610542565b606091505b5083600001846020018290528215151515815250505081516020850135176105bc577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260846000fd5b826001019250505061045c565b5082341461060c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610603906114a7565b60405180910390fd5b50505092915050565b6000606043915060008484905090508067ffffffffffffffff81111561063e5761063d6112fa565b5b60405190808252806020026020018201604052801561067157816020015b606081526020019060019003908161065c5790505b5091503660005b828110156107a157600087878381811061069557610694611329565b5b90506020028101906106a791906114c7565b92508260000160208101906106bc91906111a7565b73ffffffffffffffffffffffffffffffffffffffff168380602001906106e2919061138f565b6040516106f0929190611431565b6000604051808303816000865af19150503d806000811461072d576040519150601f19603f3d011682016040523d82523d6000602084013e610732565b606091505b5086848151811061074657610745611329565b5b60200260200101819052819250505080610795576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161078c9061153b565b60405180910390fd5b81600101915050610678565b5050509250929050565b60006001430340905090565b600046905090565b6000806060439250434091506107d68686866109f4565b905093509350939050565b600048905090565b600043905090565b60008173ffffffffffffffffffffffffffffffffffffffff16319050919050565b600044905090565b606060008383905090508067ffffffffffffffff81111561083e5761083d6112fa565b5b60405190808252806020026020018201604052801561087757816020015b610864610bd5565b81526020019060019003908161085c5790505b5091503660005b828110156109db57600084828151811061089b5761089a611329565b5b602002602001015190508686838181106108b8576108b7611329565b5b90506020028101906108ca919061155b565b92508260000160208101906108df91906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060400190610905919061138f565b604051610913929190611431565b6000604051808303816000865af19150503d8060008114610950576040519150601f19603f3d011682016040523d82523d6000602084013e610955565b606091505b5082600001836020018290528215151515815250505080516020840135176109cf577f08c379a000000000000000000000000000000000000000000000000000000000600052602060045260176024527f4d756c746963616c6c333a2063616c6c206661696c656400000000000000000060445260646000fd5b8160010191505061087e565b50505092915050565b600045905090565b600041905090565b606060008383905090508067ffffffffffffffff811115610a1857610a176112fa565b5b604051908082528060200260200182016040528015610a5157816020015b610a3e610bd5565b815260200190600190039081610a365790505b5091503660005b82811015610b9c576000848281518110610a7557610a74611329565b5b60200260200101519050868683818110610a9257610a91611329565b5b9050602002810190610aa491906114c7565b9250826000016020810190610ab991906111a7565b73ffffffffffffffffffffffffffffffffffffffff16838060200190610adf919061138f565b604051610aed929190611431565b6000604051808303816000865af19150503d8060008114610b2a576040519150601f19603f3d011682016040523d82523d6000602084013e610b2f565b606091505b508260000183602001829052821515151581525050508715610b90578060000151610b8f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b869061153b565b60405180910390fd5b5b81600101915050610a58565b5050509392505050565b6000806060610bb7600186866107bf565b8093508194508295505050509250925092565b600081409050919050565b6040518060400160405280600015158152602001606081525090565b6000819050919050565b610c0481610bf1565b82525050565b6000602082019050610c1f6000830184610bfb565b92915050565b600080fd5b600080fd5b600080fd5b600080fd5b600080fd5b60008083601f840112610c5457610c53610c2f565b5b8235905067ffffffffffffffff811115610c7157610c70610c34565b5b602083019150836020820283011115610c8d57610c8c610c39565b5b9250929050565b60008060208385031215610cab57610caa610c25565b5b600083013567ffffffffffffffff811115610cc957610cc8610c2a565b5b610cd585828601610c3e565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b60008115159050919050565b610d2281610d0d565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610d62578082015181840152602081019050610d47565b83811115610d71576000848401525b50505050565b6000601f19601f8301169050919050565b6000610d9382610d28565b610d9d8185610d33565b9350610dad818560208601610d44565b610db681610d77565b840191505092915050565b6000604083016000830151610dd96000860182610d19565b5060208301518482036020860152610df18282610d88565b9150508091505092915050565b6000610e0a8383610dc1565b905092915050565b6000602082019050919050565b6000610e2a82610ce1565b610e348185610cec565b935083602082028501610e4685610cfd565b8060005b85811015610e825784840389528151610e638582610dfe565b9450610e6e83610e12565b925060208a01995050600181019050610e4a565b50829750879550505050505092915050565b60006020820190508181036000830152610eae8184610e1f565b905092915050565b60008083601f840112610ecc57610ecb610c2f565b5b8235905067ffffffffffffffff811115610ee957610ee8610c34565b5b602083019150836020820283011115610f0557610f04610c39565b5b9250929050565b60008060208385031215610f2357610f22610c25565b5b600083013567ffffffffffffffff811115610f4157610f40610c2a565b5b610f4d85828601610eb6565b92509250509250929050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b6000610f918383610d88565b905092915050565b6000602082019050919050565b6000610fb182610f59565b610fbb8185610f64565b935083602082028501610fcd85610f75565b8060005b858110156110095784840389528151610fea8582610f85565b9450610ff583610f99565b925060208a01995050600181019050610fd1565b50829750879550505050505092915050565b60006040820190506110306000830185610bfb565b81810360208301526110428184610fa6565b90509392505050565b6000819050919050565b61105e8161104b565b82525050565b60006020820190506110796000830184611055565b92915050565b61108881610d0d565b811461109357600080fd5b50565b6000813590506110a58161107f565b92915050565b6000806000604084860312156110c4576110c3610c25565b5b60006110d286828701611096565b935050602084013567ffffffffffffffff8111156110f3576110f2610c2a565b5b6110ff86828701610eb6565b92509250509250925092565b60006060820190506111206000830186610bfb565b61112d6020830185611055565b818103604083015261113f8184610e1f565b9050949350505050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b600061117482611149565b9050919050565b61118481611169565b811461118f57600080fd5b50565b6000813590506111a18161117b565b92915050565b6000602082840312156111bd576111bc610c25565b5b60006111cb84828501611192565b91505092915050565b60008083601f8401126111ea576111e9610c2f565b5b8235905067ffffffffffffffff81111561120757611206610c34565b5b60208301915083602082028301111561122357611222610c39565b5b9250929050565b6000806020838503121561124157611240610c25565b5b600083013567ffffffffffffffff81111561125f5761125e610c2a565b5b61126b858286016111d4565b92509250509250929050565b61128081611169565b82525050565b600060208201905061129b6000830184611277565b92915050565b6112aa81610bf1565b81146112b557600080fd5b50565b6000813590506112c7816112a1565b92915050565b6000602082840312156112e3576112e2610c25565b5b60006112f1848285016112b8565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b600080fd5b600080fd5b600080fd5b60008235600160800383360303811261138357611382611358565b5b80830191505092915050565b600080833560016020038436030381126113ac576113ab611358565b5b80840192508235915067ffffffffffffffff8211156113ce576113cd61135d565b5b6020830192506001820236038313156113ea576113e9611362565b5b509250929050565b600081905092915050565b82818337600083830152505050565b600061141883856113f2565b93506114258385846113fd565b82840190509392505050565b600061143e82848661140c565b91508190509392505050565b600082825260208201905092915050565b7f4d756c746963616c6c333a2076616c7565206d69736d61746368000000000000600082015250565b6000611491601a8361144a565b915061149c8261145b565b602082019050919050565b600060208201905081810360008301526114c081611484565b9050919050565b6000823560016040038336030381126114e3576114e2611358565b5b80830191505092915050565b7f4d756c746963616c6c333a2063616c6c206661696c6564000000000000000000600082015250565b600061152560178361144a565b9150611530826114ef565b602082019050919050565b6000602082019050818103600083015261155481611518565b9050919050565b60008235600160600383360303811261157757611576611358565b5b8083019150509291505056fea264697066735822122020c1bc9aacf8e4a6507193432a895a8e77094f45a1395583f07b24e860ef06cd64736f6c634300080c0033";
//#endregion
//#region node_modules/viem/_esm/errors/chain.js
var ChainDoesNotSupportContract = class extends BaseError {
	constructor({ blockNumber, chain, contract }) {
		super(`Chain "${chain.name}" does not support contract "${contract.name}".`, {
			metaMessages: ["This could be due to any of the following:", ...blockNumber && contract.blockCreated && contract.blockCreated > blockNumber ? [`- The contract "${contract.name}" was not deployed until block ${contract.blockCreated} (current block ${blockNumber}).`] : [`- The chain does not have the contract "${contract.name}" configured.`]],
			name: "ChainDoesNotSupportContract"
		});
	}
};
var ChainMismatchError = class extends BaseError {
	constructor({ chain, currentChainId }) {
		super(`The current chain of the wallet (id: ${currentChainId}) does not match the target chain for the transaction (id: ${chain.id} – ${chain.name}).`, {
			metaMessages: [`Current Chain ID:  ${currentChainId}`, `Expected Chain ID: ${chain.id} – ${chain.name}`],
			name: "ChainMismatchError"
		});
	}
};
var ChainNotFoundError = class extends BaseError {
	constructor() {
		super(["No chain was provided to the request.", "Please provide a chain with the `chain` argument on the Action, or by supplying a `chain` to WalletClient."].join("\n"), { name: "ChainNotFoundError" });
	}
};
var ClientChainNotConfiguredError = class extends BaseError {
	constructor() {
		super("No chain was provided to the Client.", { name: "ClientChainNotConfiguredError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/abi/encodeDeployData.js
var docsPath$2 = "/docs/contract/encodeDeployData";
function encodeDeployData(parameters) {
	const { abi, args, bytecode } = parameters;
	if (!args || args.length === 0) return bytecode;
	const description = abi.find((x) => "type" in x && x.type === "constructor");
	if (!description) throw new AbiConstructorNotFoundError({ docsPath: docsPath$2 });
	if (!("inputs" in description)) throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath$2 });
	if (!description.inputs || description.inputs.length === 0) throw new AbiConstructorParamsNotFoundError({ docsPath: docsPath$2 });
	return concatHex([bytecode, encodeAbiParameters(description.inputs, args)]);
}
//#endregion
//#region node_modules/viem/_esm/utils/chain/getChainContractAddress.js
function getChainContractAddress({ blockNumber, chain, contract: name }) {
	const contract = chain?.contracts?.[name];
	if (!contract) throw new ChainDoesNotSupportContract({
		chain,
		contract: { name }
	});
	if (blockNumber && contract.blockCreated && contract.blockCreated > blockNumber) throw new ChainDoesNotSupportContract({
		blockNumber,
		chain,
		contract: {
			name,
			blockCreated: contract.blockCreated
		}
	});
	return contract.address;
}
//#endregion
//#region node_modules/viem/_esm/utils/errors/getCallError.js
function getCallError(err, { docsPath, ...args }) {
	return new CallExecutionError((() => {
		const cause = getNodeError(err, args);
		if (cause instanceof UnknownNodeError) return err;
		return cause;
	})(), {
		docsPath,
		...args
	});
}
//#endregion
//#region node_modules/viem/_esm/utils/promise/withResolvers.js
/** @internal */
function withResolvers() {
	let resolve = () => void 0;
	let reject = () => void 0;
	return {
		promise: new Promise((resolve_, reject_) => {
			resolve = resolve_;
			reject = reject_;
		}),
		resolve,
		reject
	};
}
//#endregion
//#region node_modules/viem/_esm/utils/promise/createBatchScheduler.js
var schedulerCache = /*#__PURE__*/ new Map();
/** @internal */
function createBatchScheduler({ fn, id, shouldSplitBatch, wait = 0, sort }) {
	const exec = async () => {
		const scheduler = getScheduler();
		flush();
		const args = scheduler.map(({ args }) => args);
		if (args.length === 0) return;
		fn(args).then((data) => {
			if (sort && Array.isArray(data)) data.sort(sort);
			for (let i = 0; i < scheduler.length; i++) {
				const { resolve } = scheduler[i];
				resolve?.([data[i], data]);
			}
		}).catch((err) => {
			for (let i = 0; i < scheduler.length; i++) {
				const { reject } = scheduler[i];
				reject?.(err);
			}
		});
	};
	const flush = () => schedulerCache.delete(id);
	const getBatchedArgs = () => getScheduler().map(({ args }) => args);
	const getScheduler = () => schedulerCache.get(id) || [];
	const setScheduler = (item) => schedulerCache.set(id, [...getScheduler(), item]);
	return {
		flush,
		async schedule(args) {
			const { promise, resolve, reject } = withResolvers();
			if (shouldSplitBatch?.([...getBatchedArgs(), args])) exec();
			if (getScheduler().length > 0) {
				setScheduler({
					args,
					resolve,
					reject
				});
				return promise;
			}
			setScheduler({
				args,
				resolve,
				reject
			});
			setTimeout(exec, wait);
			return promise;
		}
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/public/call.js
/**
* Executes a new message call immediately without submitting a transaction to the network.
*
* - Docs: https://viem.sh/docs/actions/public/call
* - JSON-RPC Methods: [`eth_call`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call)
*
* @param client - Client to use
* @param parameters - {@link CallParameters}
* @returns The call data. {@link CallReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { call } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const data = await call(client, {
*   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
*   data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
*   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
* })
*/
async function call(client, args) {
	const { account: account_ = client.account, authorizationList, batch = Boolean(client.batch?.multicall), blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical, accessList, blobs, blockOverrides, code, data: data_, factory, factoryData, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, requestOptions, to, value, stateOverride, ...rest } = args;
	const account = account_ ? parseAccount(account_) : void 0;
	if (code && (factory || factoryData)) throw new BaseError("Cannot provide both `code` & `factory`/`factoryData` as parameters.");
	if (code && to) throw new BaseError("Cannot provide both `code` & `to` as parameters.");
	const deploylessCallViaBytecode = code && data_;
	const deploylessCallViaFactory = factory && factoryData && to && data_;
	const deploylessCall = deploylessCallViaBytecode || deploylessCallViaFactory;
	const data = (() => {
		if (deploylessCallViaBytecode) return toDeploylessCallViaBytecodeData({
			code,
			data: data_
		});
		if (deploylessCallViaFactory) return toDeploylessCallViaFactoryData({
			data: data_,
			factory,
			factoryData,
			to
		});
		return data_;
	})();
	try {
		assertRequest(args);
		const block = formatBlockParameter({
			blockHash,
			blockNumber,
			blockTag,
			requireCanonical
		});
		const rpcBlockOverrides = blockOverrides ? toRpc(blockOverrides) : void 0;
		const rpcStateOverride = serializeStateOverride(stateOverride);
		const chainFormat = client.chain?.formatters?.transactionRequest?.format;
		const request = (chainFormat || formatTransactionRequest)({
			...extract(rest, { format: chainFormat }),
			accessList,
			account,
			authorizationList,
			blobs,
			data,
			gas,
			gasPrice,
			maxFeePerBlobGas,
			maxFeePerGas,
			maxPriorityFeePerGas,
			nonce,
			to: deploylessCall ? void 0 : to,
			value
		}, "call");
		if (batch && shouldPerformMulticall({ request }) && !rpcBlockOverrides && blockHash === void 0) try {
			const { deployless = false } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
			const multicallAddress = getMulticallAddress(client, {
				blockNumber,
				deployless
			});
			if (!multicallAddress || !hasStateOverrideForAddress(rpcStateOverride, multicallAddress)) return await scheduleMulticall$1(client, {
				...request,
				blockHash,
				blockNumber,
				blockTag,
				multicallAddress,
				requestOptions,
				requireCanonical,
				rpcStateOverride
			});
		} catch (err) {
			if (!(err instanceof ClientChainNotConfiguredError) && !(err instanceof ChainDoesNotSupportContract)) throw err;
		}
		const params = (() => {
			const base = [request, block];
			if (rpcStateOverride && rpcBlockOverrides) return [
				...base,
				rpcStateOverride,
				rpcBlockOverrides
			];
			if (rpcStateOverride) return [...base, rpcStateOverride];
			if (rpcBlockOverrides) return [
				...base,
				{},
				rpcBlockOverrides
			];
			return base;
		})();
		const response = await client.request({
			method: "eth_call",
			params
		}, requestOptions);
		if (response === "0x") return { data: void 0 };
		return { data: response };
	} catch (err) {
		if (requestOptions?.signal?.aborted) throw getAbortError(requestOptions.signal);
		if (isAbortError(err)) throw err;
		const data = getRevertErrorData(err);
		const { offchainLookup, offchainLookupSignature } = await Promise.resolve().then(() => ccip_exports);
		if (client.ccipRead !== false && data?.slice(0, 10) === offchainLookupSignature && to) return { data: await offchainLookup(client, {
			data,
			requestOptions,
			to
		}) };
		if (deploylessCall && data?.slice(0, 10) === "0x101bb98d") throw new CounterfactualDeploymentFailedError({ factory });
		throw getCallError(err, {
			...args,
			account,
			chain: client.chain
		});
	}
}
function shouldPerformMulticall({ request }) {
	const { data, to, ...request_ } = request;
	if (!data) return false;
	if (data.startsWith("0x82ad56cb")) return false;
	if (!to) return false;
	if (Object.values(request_).filter((x) => typeof x !== "undefined").length > 0) return false;
	return true;
}
var requestOptionsId = 0;
var requestOptionsIds = /* @__PURE__ */ new WeakMap();
function getRequestOptionsId(requestOptions) {
	if (!requestOptions) return "default";
	const id = requestOptionsIds.get(requestOptions);
	if (id !== void 0) return id;
	const nextId = requestOptionsId++;
	requestOptionsIds.set(requestOptions, nextId);
	return nextId;
}
async function scheduleMulticall$1(client, args) {
	const { batchSize = 1024, deployless = false, wait = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
	const { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical, data, multicallAddress: multicallAddress_, requestOptions, rpcStateOverride, to } = args;
	const multicallAddress = multicallAddress_ !== void 0 ? multicallAddress_ : getMulticallAddress(client, {
		blockNumber,
		deployless
	});
	const block = formatBlockParameter({
		blockHash,
		blockNumber,
		blockTag,
		requireCanonical
	});
	const blockId = typeof block === "string" ? block : JSON.stringify(block);
	const stateOverrideKey = rpcStateOverride ? `.${JSON.stringify(rpcStateOverride)}` : "";
	const { schedule } = createBatchScheduler({
		id: `${client.uid}.${blockId}.${getRequestOptionsId(requestOptions)}${stateOverrideKey}`,
		wait,
		shouldSplitBatch(args) {
			return args.reduce((size, { data }) => size + (data.length - 2), 0) > batchSize * 2;
		},
		fn: async (requests) => {
			const calls = requests.map((request) => ({
				allowFailure: true,
				callData: request.data,
				target: request.to
			}));
			const calldata = encodeFunctionData({
				abi: multicall3Abi,
				args: [calls],
				functionName: "aggregate3"
			});
			const multicallRequest = { ...multicallAddress === null ? { data: toDeploylessCallViaBytecodeData({
				code: multicall3Bytecode,
				data: calldata
			}) } : {
				to: multicallAddress,
				data: calldata
			} };
			const data = await client.request({
				method: "eth_call",
				params: rpcStateOverride ? [
					multicallRequest,
					block,
					rpcStateOverride
				] : [multicallRequest, block]
			}, requestOptions);
			return decodeFunctionResult({
				abi: multicall3Abi,
				args: [calls],
				functionName: "aggregate3",
				data: data || "0x"
			});
		}
	});
	const [{ returnData, success }] = await schedule({
		data,
		to
	});
	if (!success) throw new RawContractError({ data: returnData });
	if (returnData === "0x") return { data: void 0 };
	return { data: returnData };
}
function getMulticallAddress(client, parameters) {
	const { blockNumber, deployless } = parameters;
	if (deployless) return null;
	if (client.chain) return getChainContractAddress({
		blockNumber,
		chain: client.chain,
		contract: "multicall3"
	});
	throw new ClientChainNotConfiguredError();
}
function hasStateOverrideForAddress(rpcStateOverride, address) {
	if (!rpcStateOverride) return false;
	return Object.keys(rpcStateOverride).some((stateOverrideAddress) => isAddressEqual(stateOverrideAddress, address));
}
function toDeploylessCallViaBytecodeData(parameters) {
	const { code, data } = parameters;
	return encodeDeployData({
		abi: parseAbi(["constructor(bytes, bytes)"]),
		bytecode: deploylessCallViaBytecodeBytecode,
		args: [code, data]
	});
}
function toDeploylessCallViaFactoryData(parameters) {
	const { data, factory, factoryData, to } = parameters;
	return encodeDeployData({
		abi: parseAbi(["constructor(address, bytes, address, bytes)"]),
		bytecode: deploylessCallViaFactoryBytecode,
		args: [
			to,
			data,
			factory,
			factoryData
		]
	});
}
/** @internal */
function getRevertErrorData(err) {
	if (!(err instanceof BaseError)) return void 0;
	const error = err.walk();
	return typeof error?.data === "object" ? error.data?.data : error.data;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/readContract.js
/**
* Calls a read-only function on a contract, and returns the response.
*
* - Docs: https://viem.sh/docs/contract/readContract
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_reading-contracts
*
* A "read-only" function (constant function) on a Solidity contract is denoted by a `view` or `pure` keyword. They can only read the state of the contract, and cannot make any changes to it. Since read-only methods do not change the state of the contract, they do not require any gas to be executed, and can be called by any user without the need to pay for gas.
*
* Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
*
* @param client - Client to use
* @param parameters - {@link ReadContractParameters}
* @returns The response from the contract. Type is inferred. {@link ReadContractReturnType}
*
* @example
* import { createPublicClient, http, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { readContract } from 'viem/contract'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const result = await readContract(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*   abi: parseAbi(['function balanceOf(address) view returns (uint256)']),
*   functionName: 'balanceOf',
*   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
* })
* // 424122n
*/
async function readContract(client, parameters) {
	const { abi, address, args, functionName, ...rest } = parameters;
	const calldata = encodeFunctionData({
		abi,
		args,
		functionName
	});
	try {
		const { data } = await getAction(client, call, "call")({
			...rest,
			data: calldata,
			to: address
		});
		return decodeFunctionResult({
			abi,
			args,
			functionName,
			data: data || "0x"
		});
	} catch (error) {
		throw getContractError(error, {
			abi,
			address,
			args,
			docsPath: "/docs/contract/readContract",
			functionName
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/public/simulateContract.js
/**
* Simulates/validates a contract interaction. This is useful for retrieving **return data** and **revert reasons** of contract write functions.
*
* - Docs: https://viem.sh/docs/contract/simulateContract
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_writing-to-contracts
*
* This function does not require gas to execute and _**does not**_ change the state of the blockchain. It is almost identical to [`readContract`](https://viem.sh/docs/contract/readContract), but also supports contract write functions.
*
* Internally, uses a [Public Client](https://viem.sh/docs/clients/public) to call the [`call` action](https://viem.sh/docs/actions/public/call) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
*
* @param client - Client to use
* @param parameters - {@link SimulateContractParameters}
* @returns The simulation result and write request. {@link SimulateContractReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { simulateContract } from 'viem/contract'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const result = await simulateContract(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*   abi: parseAbi(['function mint(uint32) view returns (uint32)']),
*   functionName: 'mint',
*   args: ['69420'],
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
* })
*/
async function simulateContract(client, parameters) {
	const { abi, address, args, functionName, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, ...callRequest } = parameters;
	const account = callRequest.account ? parseAccount(callRequest.account) : client.account;
	const calldata = encodeFunctionData({
		abi,
		args,
		functionName
	});
	try {
		const { data } = await getAction(client, call, "call")({
			batch: false,
			data: `${calldata}${dataSuffix ? dataSuffix.replace("0x", "") : ""}`,
			to: address,
			...callRequest,
			account
		});
		return {
			result: decodeFunctionResult({
				abi,
				args,
				functionName,
				data: data || "0x"
			}),
			request: {
				abi: abi.filter((abiItem) => "name" in abiItem && abiItem.name === parameters.functionName),
				address,
				args,
				dataSuffix,
				functionName,
				...callRequest,
				account
			}
		};
	} catch (error) {
		throw getContractError(error, {
			abi,
			address,
			args,
			docsPath: "/docs/contract/simulateContract",
			functionName,
			sender: account?.address
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/utils/observe.js
/** @internal */
var listenersCache = /*#__PURE__*/ new Map();
/** @internal */
var cleanupCache = /*#__PURE__*/ new Map();
var callbackCount = 0;
/**
* @description Sets up an observer for a given function. If another function
* is set up under the same observer id, the function will only be called once
* for both instances of the observer.
*/
function observe(observerId, callbacks, fn) {
	const callbackId = ++callbackCount;
	const getListeners = () => listenersCache.get(observerId) || [];
	const unsubscribe = () => {
		const nextListeners = getListeners().filter((cb) => cb.id !== callbackId);
		if (nextListeners.length === 0) {
			listenersCache.delete(observerId);
			cleanupCache.delete(observerId);
			return;
		}
		listenersCache.set(observerId, nextListeners);
	};
	const unwatch = () => {
		const listeners = getListeners();
		if (!listeners.some((cb) => cb.id === callbackId)) return;
		const cleanup = cleanupCache.get(observerId);
		if (listeners.length === 1 && cleanup) {
			const p = cleanup();
			if (p instanceof Promise) p.catch(() => {});
		}
		unsubscribe();
	};
	const listeners = getListeners();
	listenersCache.set(observerId, [...listeners, {
		id: callbackId,
		fns: callbacks
	}]);
	if (listeners && listeners.length > 0) return unwatch;
	const emit = {};
	for (const key in callbacks) emit[key] = ((...args) => {
		const listeners = getListeners();
		if (listeners.length === 0) return;
		for (const listener of listeners) listener.fns[key]?.(...args);
	});
	const cleanup = fn(emit);
	if (typeof cleanup === "function") cleanupCache.set(observerId, cleanup);
	return unwatch;
}
//#endregion
//#region node_modules/viem/_esm/utils/wait.js
async function wait(time, { signal } = {}) {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(getAbortError(signal));
			return;
		}
		const cleanup = () => signal?.removeEventListener("abort", onAbort);
		const timeout = setTimeout(() => {
			cleanup();
			resolve();
		}, time);
		const onAbort = () => {
			clearTimeout(timeout);
			cleanup();
			reject(getAbortError(signal));
		};
		signal?.addEventListener("abort", onAbort, { once: true });
	});
}
//#endregion
//#region node_modules/viem/_esm/utils/poll.js
/**
* @description Polls a function at a specified interval.
*/
function poll(fn, { emitOnBegin, initialWaitTime, interval }) {
	let active = true;
	const unwatch = () => active = false;
	const watch = async () => {
		let data;
		if (emitOnBegin) data = await fn({ unpoll: unwatch });
		await wait(await initialWaitTime?.(data) ?? interval);
		const poll = async () => {
			if (!active) return;
			await fn({ unpoll: unwatch });
			await wait(interval);
			poll();
		};
		poll();
	};
	watch();
	return unwatch;
}
//#endregion
//#region node_modules/viem/_esm/utils/promise/withCache.js
/** @internal */
var promiseCache$1 = /*#__PURE__*/ new Map();
/** @internal */
var responseCache = /*#__PURE__*/ new Map();
function getCache(cacheKey) {
	const buildCache = (cacheKey, cache) => ({
		clear: () => cache.delete(cacheKey),
		get: () => cache.get(cacheKey),
		set: (data) => cache.set(cacheKey, data)
	});
	const promise = buildCache(cacheKey, promiseCache$1);
	const response = buildCache(cacheKey, responseCache);
	return {
		clear: () => {
			promise.clear();
			response.clear();
		},
		promise,
		response
	};
}
/**
* @description Returns the result of a given promise, and caches the result for
* subsequent invocations against a provided cache key.
*/
async function withCache(fn, { cacheKey, cacheTime = Number.POSITIVE_INFINITY }) {
	const cache = getCache(cacheKey);
	const response = cache.response.get();
	if (response && cacheTime > 0) {
		if (Date.now() - response.created.getTime() < cacheTime) return response.data;
	}
	let promise = cache.promise.get();
	if (!promise) {
		promise = fn();
		cache.promise.set(promise);
	}
	try {
		const data = await promise;
		cache.response.set({
			created: /* @__PURE__ */ new Date(),
			data
		});
		return data;
	} finally {
		cache.promise.clear();
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getBlockNumber.js
var cacheKey = (id) => `blockNumber.${id}`;
/**
* Returns the number of the most recent block seen.
*
* - Docs: https://viem.sh/docs/actions/public/getBlockNumber
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_fetching-blocks
* - JSON-RPC Methods: [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber)
*
* @param client - Client to use
* @param parameters - {@link GetBlockNumberParameters}
* @returns The number of the block. {@link GetBlockNumberReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getBlockNumber } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const blockNumber = await getBlockNumber(client)
* // 69420n
*/
async function getBlockNumber(client, { cacheTime = client.cacheTime } = {}) {
	const blockNumberHex = await withCache(() => client.request({ method: "eth_blockNumber" }), {
		cacheKey: cacheKey(client.uid),
		cacheTime
	});
	return BigInt(blockNumberHex);
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getFilterChanges.js
/**
* Returns a list of logs or hashes based on a [Filter](/docs/glossary/terms#filter) since the last time it was called.
*
* - Docs: https://viem.sh/docs/actions/public/getFilterChanges
* - JSON-RPC Methods: [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges)
*
* A Filter can be created from the following actions:
*
* - [`createBlockFilter`](https://viem.sh/docs/actions/public/createBlockFilter)
* - [`createContractEventFilter`](https://viem.sh/docs/contract/createContractEventFilter)
* - [`createEventFilter`](https://viem.sh/docs/actions/public/createEventFilter)
* - [`createPendingTransactionFilter`](https://viem.sh/docs/actions/public/createPendingTransactionFilter)
*
* Depending on the type of filter, the return value will be different:
*
* - If the filter was created with `createContractEventFilter` or `createEventFilter`, it returns a list of logs.
* - If the filter was created with `createPendingTransactionFilter`, it returns a list of transaction hashes.
* - If the filter was created with `createBlockFilter`, it returns a list of block hashes.
*
* @param client - Client to use
* @param parameters - {@link GetFilterChangesParameters}
* @returns Logs or hashes. {@link GetFilterChangesReturnType}
*
* @example
* // Blocks
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createBlockFilter, getFilterChanges } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createBlockFilter(client)
* const hashes = await getFilterChanges(client, { filter })
*
* @example
* // Contract Events
* import { createPublicClient, http, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createContractEventFilter, getFilterChanges } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createContractEventFilter(client, {
*   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
*   abi: parseAbi(['event Transfer(address indexed, address indexed, uint256)']),
*   eventName: 'Transfer',
* })
* const logs = await getFilterChanges(client, { filter })
*
* @example
* // Raw Events
* import { createPublicClient, http, parseAbiItem } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createEventFilter, getFilterChanges } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createEventFilter(client, {
*   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
*   event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
* })
* const logs = await getFilterChanges(client, { filter })
*
* @example
* // Transactions
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createPendingTransactionFilter, getFilterChanges } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createPendingTransactionFilter(client)
* const hashes = await getFilterChanges(client, { filter })
*/
async function getFilterChanges(_client, { filter }) {
	const strict = "strict" in filter && filter.strict;
	const logs = await filter.request({
		method: "eth_getFilterChanges",
		params: [filter.id]
	});
	if (typeof logs[0] === "string") return logs;
	const formattedLogs = logs.map((log) => formatLog(log));
	if (!("abi" in filter) || !filter.abi) return formattedLogs;
	return parseEventLogs({
		abi: filter.abi,
		logs: formattedLogs,
		strict
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/uninstallFilter.js
/**
* Destroys a [`Filter`](https://viem.sh/docs/glossary/types#filter).
*
* - Docs: https://viem.sh/docs/actions/public/uninstallFilter
* - JSON-RPC Methods: [`eth_uninstallFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_uninstallFilter)
*
* Destroys a Filter that was created from one of the following Actions:
* - [`createBlockFilter`](https://viem.sh/docs/actions/public/createBlockFilter)
* - [`createEventFilter`](https://viem.sh/docs/actions/public/createEventFilter)
* - [`createPendingTransactionFilter`](https://viem.sh/docs/actions/public/createPendingTransactionFilter)
*
* @param client - Client to use
* @param parameters - {@link UninstallFilterParameters}
* @returns A boolean indicating if the Filter was successfully uninstalled. {@link UninstallFilterReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createPendingTransactionFilter, uninstallFilter } from 'viem/public'
*
* const filter = await createPendingTransactionFilter(client)
* const uninstalled = await uninstallFilter(client, { filter })
* // true
*/
async function uninstallFilter(_client, { filter }) {
	return filter.request({
		method: "eth_uninstallFilter",
		params: [filter.id]
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/watchContractEvent.js
/**
* Watches and returns emitted contract event logs.
*
* - Docs: https://viem.sh/docs/contract/watchContractEvent
*
* This Action will batch up all the event logs found within the [`pollingInterval`](https://viem.sh/docs/contract/watchContractEvent#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/contract/watchContractEvent#onLogs).
*
* `watchContractEvent` will attempt to create an [Event Filter](https://viem.sh/docs/contract/createContractEventFilter) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchContractEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
*
* @param client - Client to use
* @param parameters - {@link WatchContractEventParameters}
* @returns A function that can be invoked to stop watching for new event logs. {@link WatchContractEventReturnType}
*
* @example
* import { createPublicClient, http, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { watchContractEvent } from 'viem/contract'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const unwatch = watchContractEvent(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*   abi: parseAbi(['event Transfer(address indexed from, address indexed to, uint256 value)']),
*   eventName: 'Transfer',
*   args: { from: '0xc961145a54C96E3aE9bAA048c4F4D6b04C13916b' },
*   onLogs: (logs) => console.log(logs),
* })
*/
function watchContractEvent(client, parameters) {
	const { abi, address, args, batch = true, eventName, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ } = parameters;
	const enablePolling = (() => {
		if (typeof poll_ !== "undefined") return poll_;
		if (typeof fromBlock === "bigint") return true;
		if (client.transport.type === "webSocket" || client.transport.type === "ipc") return false;
		if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc")) return false;
		return true;
	})();
	const pollContractEvent = () => {
		const strict = strict_ ?? false;
		return observe(stringify([
			"watchContractEvent",
			address,
			args,
			batch,
			client.uid,
			eventName,
			pollingInterval,
			strict,
			fromBlock
		]), {
			onLogs,
			onError
		}, (emit) => {
			let previousBlockNumber;
			if (fromBlock !== void 0) previousBlockNumber = fromBlock - 1n;
			let filter;
			let initialized = false;
			const unwatch = poll(async () => {
				if (!initialized) {
					try {
						filter = await getAction(client, createContractEventFilter, "createContractEventFilter")({
							abi,
							address,
							args,
							eventName,
							strict,
							fromBlock
						});
					} catch {}
					initialized = true;
					return;
				}
				try {
					let logs;
					if (filter) logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
					else {
						const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
						if (previousBlockNumber && previousBlockNumber < blockNumber) logs = await getAction(client, getContractEvents, "getContractEvents")({
							abi,
							address,
							args,
							eventName,
							fromBlock: previousBlockNumber + 1n,
							toBlock: blockNumber,
							strict
						});
						else logs = [];
						previousBlockNumber = blockNumber;
					}
					if (logs.length === 0) return;
					if (batch) emit.onLogs(logs);
					else for (const log of logs) emit.onLogs([log]);
				} catch (err) {
					if (filter && err instanceof InvalidInputRpcError) initialized = false;
					emit.onError?.(err);
				}
			}, {
				emitOnBegin: true,
				interval: pollingInterval
			});
			return async () => {
				if (filter) await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
				unwatch();
			};
		});
	};
	const subscribeContractEvent = () => {
		const strict = strict_ ?? false;
		const observerId = stringify([
			"watchContractEvent",
			address,
			args,
			batch,
			client.uid,
			eventName,
			pollingInterval,
			strict
		]);
		let active = true;
		let unsubscribe = () => active = false;
		return observe(observerId, {
			onLogs,
			onError
		}, (emit) => {
			(async () => {
				try {
					const transport = (() => {
						if (client.transport.type === "fallback") {
							const transport = client.transport.transports.find((transport) => transport.config.type === "webSocket" || transport.config.type === "ipc");
							if (!transport) return client.transport;
							return transport.value;
						}
						return client.transport;
					})();
					const topics = eventName ? encodeEventTopics({
						abi,
						eventName,
						args
					}) : [];
					const { unsubscribe: unsubscribe_ } = await transport.subscribe({
						params: ["logs", {
							address,
							topics
						}],
						onData(data) {
							if (!active) return;
							const log = data.result;
							try {
								const { eventName, args } = decodeEventLog({
									abi,
									data: log.data,
									topics: log.topics,
									strict: strict_
								});
								const formatted = formatLog(log, {
									args,
									eventName
								});
								emit.onLogs([formatted]);
							} catch (err) {
								let eventName;
								let isUnnamed;
								if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
									if (strict_) return;
									eventName = err.abiItem.name;
									isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
								}
								const formatted = formatLog(log, {
									args: isUnnamed ? [] : {},
									eventName
								});
								emit.onLogs([formatted]);
							}
						},
						onError(error) {
							emit.onError?.(error);
						}
					});
					unsubscribe = unsubscribe_;
					if (!active) unsubscribe();
				} catch (err) {
					onError?.(err);
				}
			})();
			return () => unsubscribe();
		});
	};
	return enablePolling ? pollContractEvent() : subscribeContractEvent();
}
//#endregion
//#region node_modules/viem/_esm/errors/account.js
var AccountNotFoundError = class extends BaseError {
	constructor({ docsPath } = {}) {
		super(["Could not find an Account to execute with this Action.", "Please provide an Account with the `account` argument on the Action, or by supplying an `account` to the Client."].join("\n"), {
			docsPath,
			docsSlug: "account",
			name: "AccountNotFoundError"
		});
	}
};
var AccountTypeNotSupportedError = class extends BaseError {
	constructor({ docsPath, metaMessages, type }) {
		super(`Account type "${type}" is not supported.`, {
			docsPath,
			metaMessages,
			name: "AccountTypeNotSupportedError"
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/chain/assertCurrentChain.js
function assertCurrentChain({ chain, currentChainId }) {
	if (!chain) throw new ChainNotFoundError();
	if (currentChainId !== chain.id) throw new ChainMismatchError({
		chain,
		currentChainId
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/sendRawTransaction.js
/**
* Sends a **signed** transaction to the network
*
* - Docs: https://viem.sh/docs/actions/wallet/sendRawTransaction
* - JSON-RPC Method: [`eth_sendRawTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
*
* @param client - Client to use
* @param parameters - {@link SendRawTransactionParameters}
* @returns The transaction hash. {@link SendRawTransactionReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { sendRawTransaction } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
*
* const hash = await sendRawTransaction(client, {
*   serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33'
* })
*/
async function sendRawTransaction(client, { serializedTransaction }) {
	return client.request({
		method: "eth_sendRawTransaction",
		params: [serializedTransaction]
	}, { retryCount: 0 });
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/sendTransaction.js
var supportsWalletNamespace$1 = new LruMap(128);
/**
* Creates, signs, and sends a new transaction to the network.
*
* - Docs: https://viem.sh/docs/actions/wallet/sendTransaction
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions
* - JSON-RPC Methods:
*   - JSON-RPC Accounts: [`eth_sendTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendtransaction)
*   - Local Accounts: [`eth_sendRawTransaction`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_sendrawtransaction)
*
* @param client - Client to use
* @param parameters - {@link SendTransactionParameters}
* @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link SendTransactionReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { sendTransaction } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const hash = await sendTransaction(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*   value: 1000000000000000000n,
* })
*
* @example
* // Account Hoisting
* import { createWalletClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { sendTransaction } from 'viem/wallet'
*
* const client = createWalletClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: http(),
* })
* const hash = await sendTransaction(client, {
*   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*   value: 1000000000000000000n,
* })
*/
async function sendTransaction(client, parameters) {
	const { account: account_ = client.account, assertChainId = true, chain = client.chain, accessList, authorizationList, blobs, data, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, type, value, ...rest } = parameters;
	if (typeof account_ === "undefined") throw new AccountNotFoundError({ docsPath: "/docs/actions/wallet/sendTransaction" });
	const account = account_ ? parseAccount(account_) : null;
	let nonceManagerParameters;
	try {
		assertRequest(parameters);
		const to = await (async () => {
			if (parameters.to) return parameters.to;
			if (parameters.to === null) return void 0;
			if (authorizationList && authorizationList.length > 0) return await recoverAuthorizationAddress({ authorization: authorizationList[0] }).catch(() => {
				throw new BaseError("`to` is required. Could not infer from `authorizationList`.");
			});
		})();
		if (account?.type === "json-rpc" || account === null) {
			let chainId;
			if (chain !== null) {
				chainId = await getAction(client, getChainId, "getChainId")({});
				if (assertChainId) assertCurrentChain({
					currentChainId: chainId,
					chain
				});
			}
			const chainFormat = client.chain?.formatters?.transactionRequest?.format;
			const request = (chainFormat || formatTransactionRequest)({
				...extract(rest, { format: chainFormat }),
				accessList,
				account,
				authorizationList,
				blobs,
				chainId,
				data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
				gas,
				gasPrice,
				maxFeePerBlobGas,
				maxFeePerGas,
				maxPriorityFeePerGas,
				nonce,
				to,
				type,
				value
			}, "sendTransaction");
			const isWalletNamespaceSupported = supportsWalletNamespace$1.get(client.uid);
			const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
			try {
				return await client.request({
					method,
					params: [request]
				}, { retryCount: 0 });
			} catch (e) {
				if (isWalletNamespaceSupported === false) throw e;
				const error = e;
				if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") return await client.request({
					method: "wallet_sendTransaction",
					params: [request]
				}, { retryCount: 0 }).then((hash) => {
					supportsWalletNamespace$1.set(client.uid, true);
					return hash;
				}).catch((e) => {
					const walletNamespaceError = e;
					if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
						supportsWalletNamespace$1.set(client.uid, false);
						throw error;
					}
					throw walletNamespaceError;
				});
				throw error;
			}
		}
		if (account?.type === "local") {
			const nonceManager = (() => {
				if (!account.nonceManager || typeof nonce !== "undefined") return account.nonceManager;
				const nonceManager = account.nonceManager;
				return {
					consume(parameters) {
						nonceManagerParameters = {
							address: parameters.address,
							chainId: parameters.chainId
						};
						return nonceManager.consume(parameters);
					},
					get(parameters) {
						return nonceManager.get(parameters);
					},
					increment(parameters) {
						return nonceManager.increment(parameters);
					},
					reset(parameters) {
						return nonceManager.reset(parameters);
					}
				};
			})();
			const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
				account,
				accessList,
				authorizationList,
				blobs,
				chain,
				data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
				gas,
				gasPrice,
				maxFeePerBlobGas,
				maxFeePerGas,
				maxPriorityFeePerGas,
				nonce,
				nonceManager,
				parameters: [...defaultParameters, "sidecars"],
				type,
				value,
				...rest,
				to
			});
			const serializer = chain?.serializers?.transaction;
			const signedTransaction = await account.signTransaction(request, { serializer });
			const transactionEnvelope = (chain ?? client.chain)?.serializers?.transactionEnvelope;
			const serializedTransaction = transactionEnvelope ? await transactionEnvelope({
				serializedTransaction: signedTransaction,
				transaction: request
			}) : signedTransaction;
			return await getAction(client, sendRawTransaction, "sendRawTransaction")({ serializedTransaction });
		}
		if (account?.type === "smart") throw new AccountTypeNotSupportedError({
			metaMessages: ["Consider using the `sendUserOperation` Action instead."],
			docsPath: "/docs/actions/bundler/sendUserOperation",
			type: "smart"
		});
		throw new AccountTypeNotSupportedError({
			docsPath: "/docs/actions/wallet/sendTransaction",
			type: account?.type
		});
	} catch (err) {
		if (err instanceof AccountTypeNotSupportedError) throw err;
		if (nonceManagerParameters) account?.nonceManager?.reset(nonceManagerParameters);
		throw getTransactionError(err, {
			...parameters,
			account,
			chain: parameters.chain || void 0
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/writeContract.js
/**
* Executes a write function on a contract.
*
* - Docs: https://viem.sh/docs/contract/writeContract
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_writing-to-contracts
*
* A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms) is needed to be broadcast in order to change the state.
*
* Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
*
* __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract#usage) before you execute it.__
*
* @param client - Client to use
* @param parameters - {@link WriteContractParameters}
* @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms#hash). {@link WriteContractReturnType}
*
* @example
* import { createWalletClient, custom, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { writeContract } from 'viem/contract'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const hash = await writeContract(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
*   functionName: 'mint',
*   args: [69420],
* })
*
* @example
* // With Validation
* import { createWalletClient, http, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { simulateContract, writeContract } from 'viem/contract'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: http(),
* })
* const { request } = await simulateContract(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
*   functionName: 'mint',
*   args: [69420],
* }
* const hash = await writeContract(client, request)
*/
async function writeContract(client, parameters) {
	return writeContract.internal(client, sendTransaction, "sendTransaction", parameters);
}
(function(writeContract) {
	async function internal(client, actionFn, name, parameters) {
		const { abi, account: account_ = client.account, address, args, functionName, ...request } = parameters;
		if (typeof account_ === "undefined") throw new AccountNotFoundError({ docsPath: "/docs/contract/writeContract" });
		const account = account_ ? parseAccount(account_) : null;
		const data = encodeFunctionData({
			abi,
			args,
			functionName
		});
		try {
			return await getAction(client, actionFn, name)({
				data,
				to: address,
				account,
				...request
			});
		} catch (error) {
			throw getContractError(error, {
				abi,
				address,
				args,
				docsPath: "/docs/contract/writeContract",
				functionName,
				sender: account?.address
			});
		}
	}
	writeContract.internal = internal;
})(writeContract || (writeContract = {}));
//#endregion
//#region node_modules/viem/_esm/errors/calls.js
var BundleFailedError = class extends BaseError {
	constructor(result) {
		super(`Call bundle failed with status: ${result.statusCode}`, { name: "BundleFailedError" });
		Object.defineProperty(this, "result", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		this.result = result;
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/promise/withRetry.js
function withRetry(fn, { delay: delay_ = 100, retryCount = 2, shouldRetry = () => true, signal } = {}) {
	return new Promise((resolve, reject) => {
		const attemptRetry = async ({ count = 0 } = {}) => {
			if (signal?.aborted) {
				reject(getAbortError(signal));
				return;
			}
			const retry = async ({ error }) => {
				const delay = typeof delay_ === "function" ? delay_({
					count,
					error
				}) : delay_;
				if (delay) try {
					await wait(delay, { signal });
				} catch (err) {
					reject(err);
					return;
				}
				return attemptRetry({ count: count + 1 });
			};
			try {
				resolve(await fn());
			} catch (err) {
				if (signal?.aborted) {
					reject(getAbortError(signal));
					return;
				}
				if (isAbortError(err)) {
					reject(err);
					return;
				}
				if (count < retryCount && await shouldRetry({
					count,
					error: err
				})) return retry({ error: err });
				reject(err);
			}
		};
		attemptRetry().catch(reject);
	});
}
//#endregion
//#region node_modules/viem/_esm/utils/formatters/transactionReceipt.js
var receiptStatuses = {
	"0x0": "reverted",
	"0x1": "success"
};
function formatTransactionReceipt(transactionReceipt, _) {
	const receipt = {
		...transactionReceipt,
		blockNumber: transactionReceipt.blockNumber ? BigInt(transactionReceipt.blockNumber) : null,
		contractAddress: transactionReceipt.contractAddress ? transactionReceipt.contractAddress : null,
		cumulativeGasUsed: transactionReceipt.cumulativeGasUsed ? BigInt(transactionReceipt.cumulativeGasUsed) : null,
		effectiveGasPrice: transactionReceipt.effectiveGasPrice ? BigInt(transactionReceipt.effectiveGasPrice) : null,
		gasUsed: transactionReceipt.gasUsed ? BigInt(transactionReceipt.gasUsed) : null,
		logs: transactionReceipt.logs ? transactionReceipt.logs.map((log) => formatLog(log)) : null,
		to: transactionReceipt.to ? transactionReceipt.to : null,
		transactionIndex: transactionReceipt.transactionIndex ? hexToNumber(transactionReceipt.transactionIndex) : null,
		status: transactionReceipt.status ? receiptStatuses[transactionReceipt.status] : null,
		type: transactionReceipt.type ? transactionType[transactionReceipt.type] || transactionReceipt.type : null
	};
	if (transactionReceipt.blobGasPrice) receipt.blobGasPrice = BigInt(transactionReceipt.blobGasPrice);
	if (transactionReceipt.blobGasUsed) receipt.blobGasUsed = BigInt(transactionReceipt.blobGasUsed);
	return receipt;
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/sendCalls.js
var fallbackMagicIdentifier = "0x5792579257925792579257925792579257925792579257925792579257925792";
var fallbackTransactionErrorMagicIdentifier = numberToHex(0, { size: 32 });
/**
* Requests the connected wallet to send a batch of calls.
*
* - Docs: https://viem.sh/docs/actions/wallet/sendCalls
* - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
*
* @param client - Client to use
* @returns Transaction identifier. {@link SendCallsReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { sendCalls } from 'viem/actions'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const id = await sendCalls(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   calls: [
*     {
*       data: '0xdeadbeef',
*       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*     },
*     {
*       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*       value: 69420n,
*     },
*   ],
* })
*/
async function sendCalls(client, parameters) {
	const { account: account_ = client.account, chain = client.chain, experimental_fallback, experimental_fallbackDelay = 32, forceAtomic = false, id, version = "2.0.0" } = parameters;
	const account = account_ ? parseAccount(account_) : null;
	let capabilities = parameters.capabilities;
	if (client.dataSuffix && !parameters.capabilities?.dataSuffix) {
		if (typeof client.dataSuffix === "string") capabilities = {
			...parameters.capabilities,
			dataSuffix: {
				value: client.dataSuffix,
				optional: true
			}
		};
		else capabilities = {
			...parameters.capabilities,
			dataSuffix: {
				value: client.dataSuffix.value,
				...client.dataSuffix.required ? {} : { optional: true }
			}
		};
	}
	const calls = parameters.calls.map((call_) => {
		const call = call_;
		const data = call.abi ? encodeFunctionData({
			abi: call.abi,
			functionName: call.functionName,
			args: call.args
		}) : call.data;
		return {
			data: call.dataSuffix && data ? concat([data, call.dataSuffix]) : data,
			to: call.to,
			value: call.value ? numberToHex(call.value) : void 0
		};
	});
	try {
		const response = await client.request({
			method: "wallet_sendCalls",
			params: [{
				atomicRequired: forceAtomic,
				calls,
				capabilities,
				chainId: numberToHex(chain.id),
				from: account?.address,
				id,
				version
			}]
		}, { retryCount: 0 });
		if (typeof response === "string") return { id: response };
		return response;
	} catch (err) {
		const error = err;
		if (experimental_fallback && (error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError" || error.name === "UnknownRpcError" || error.details.toLowerCase().includes("does not exist / is not available") || error.details.toLowerCase().includes("missing or invalid. request()") || error.details.toLowerCase().includes("did not match any variant of untagged enum") || error.details.toLowerCase().includes("account upgraded to unsupported contract") || error.details.toLowerCase().includes("eip-7702 not supported") || error.details.toLowerCase().includes("unsupported wc_ method") || error.details.toLowerCase().includes("feature toggled misconfigured") || error.details.toLowerCase().includes("jsonrpcengine: response has no error or result for request"))) {
			if (capabilities) {
				if (Object.values(capabilities).some((capability) => !capability.optional)) {
					const message = "non-optional `capabilities` are not supported on fallback to `eth_sendTransaction`.";
					throw new UnsupportedNonOptionalCapabilityError(new BaseError(message, { details: message }));
				}
			}
			if (forceAtomic && calls.length > 1) {
				const message = "`forceAtomic` is not supported on fallback to `eth_sendTransaction`.";
				throw new AtomicityNotSupportedError(new BaseError(message, { details: message }));
			}
			const results = [];
			for (const call of calls) {
				try {
					const value = await sendTransaction(client, {
						account,
						chain,
						data: call.data,
						to: call.to,
						value: call.value ? hexToBigInt(call.value) : void 0
					});
					results.push({
						status: "fulfilled",
						value
					});
				} catch (reason) {
					results.push({
						reason,
						status: "rejected"
					});
				}
				if (experimental_fallbackDelay > 0) await new Promise((resolve) => setTimeout(resolve, experimental_fallbackDelay));
			}
			if (results.every((r) => r.status === "rejected")) throw results[0].reason;
			return { id: concat([
				...results.map((result) => {
					if (result.status === "fulfilled") return result.value;
					return fallbackTransactionErrorMagicIdentifier;
				}),
				numberToHex(chain.id, { size: 32 }),
				fallbackMagicIdentifier
			]) };
		}
		throw getTransactionError(err, {
			...parameters,
			account,
			chain: parameters.chain
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/getCallsStatus.js
/**
* Returns the status of a call batch that was sent via `sendCalls`.
*
* - Docs: https://viem.sh/docs/actions/wallet/getCallsStatus
* - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
*
* @param client - Client to use
* @returns Status of the calls. {@link GetCallsStatusReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getCallsStatus } from 'viem/actions'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const { receipts, status } = await getCallsStatus(client, { id: '0xdeadbeef' })
*/
async function getCallsStatus(client, parameters) {
	async function getStatus(id) {
		if (id.endsWith("0x5792579257925792579257925792579257925792579257925792579257925792".slice(2))) {
			const chainId = trim(sliceHex(id, -64, -32));
			const hashes = sliceHex(id, 0, -64).slice(2).match(/.{1,64}/g);
			const receipts = await Promise.all(hashes.map((hash) => fallbackTransactionErrorMagicIdentifier.slice(2) !== hash ? client.request({
				method: "eth_getTransactionReceipt",
				params: [`0x${hash}`]
			}, { dedupe: true }) : void 0));
			const status = (() => {
				if (receipts.some((r) => r === null)) return 100;
				if (receipts.every((r) => r?.status === "0x1")) return 200;
				if (receipts.every((r) => r?.status === "0x0")) return 500;
				return 600;
			})();
			return {
				atomic: false,
				chainId: hexToNumber(chainId),
				receipts: receipts.filter(Boolean),
				status,
				version: "2.0.0"
			};
		}
		return client.request({
			method: "wallet_getCallsStatus",
			params: [id]
		});
	}
	const { atomic = false, chainId, receipts, version = "2.0.0", ...response } = await getStatus(parameters.id);
	const [status, statusCode] = (() => {
		const statusCode = response.status;
		if (statusCode >= 100 && statusCode < 200) return ["pending", statusCode];
		if (statusCode >= 200 && statusCode < 300) return ["success", statusCode];
		if (statusCode >= 300 && statusCode < 700) return ["failure", statusCode];
		if (statusCode === "CONFIRMED") return ["success", 200];
		if (statusCode === "PENDING") return ["pending", 100];
		return [void 0, statusCode];
	})();
	return {
		...response,
		atomic,
		chainId: chainId ? hexToNumber(chainId) : void 0,
		receipts: receipts?.map((receipt) => ({
			...receipt,
			blockNumber: hexToBigInt(receipt.blockNumber),
			gasUsed: hexToBigInt(receipt.gasUsed),
			status: receiptStatuses[receipt.status]
		})) ?? [],
		statusCode,
		status,
		version
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/waitForCallsStatus.js
/**
* Waits for the status & receipts of a call bundle that was sent via `sendCalls`.
*
* - Docs: https://viem.sh/docs/actions/wallet/waitForCallsStatus
* - JSON-RPC Methods: [`wallet_getCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
*
* @param client - Client to use
* @param parameters - {@link WaitForCallsStatusParameters}
* @returns Status & receipts of the call bundle. {@link WaitForCallsStatusReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { waitForCallsStatus } from 'viem/actions'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
*
* const { receipts, status } = await waitForCallsStatus(client, { id: '0xdeadbeef' })
*/
async function waitForCallsStatus(client, parameters) {
	const { id, pollingInterval = client.pollingInterval, status = ({ statusCode }) => statusCode === 200 || statusCode >= 300, retryCount = 4, retryDelay = ({ count }) => ~~(1 << count) * 200, timeout = 6e4, throwOnFailure = false } = parameters;
	const observerId = stringify([
		"waitForCallsStatus",
		client.uid,
		id
	]);
	const { promise, resolve, reject } = withResolvers();
	let timer;
	const unobserve = observe(observerId, {
		resolve,
		reject
	}, (emit) => {
		const unpoll = poll(async () => {
			const done = (fn) => {
				clearTimeout(timer);
				unpoll();
				fn();
				unobserve();
			};
			try {
				const result = await withRetry(async () => {
					const result = await getAction(client, getCallsStatus, "getCallsStatus")({ id });
					if (throwOnFailure && result.status === "failure") throw new BundleFailedError(result);
					return result;
				}, {
					retryCount,
					delay: retryDelay
				});
				if (!status(result)) return;
				done(() => emit.resolve(result));
			} catch (error) {
				done(() => emit.reject(error));
			}
		}, {
			interval: pollingInterval,
			emitOnBegin: true
		});
		return unpoll;
	});
	timer = timeout ? setTimeout(() => {
		unobserve();
		clearTimeout(timer);
		reject(new WaitForCallsStatusTimeoutError({ id }));
	}, timeout) : void 0;
	return await promise;
}
var WaitForCallsStatusTimeoutError = class extends BaseError {
	constructor({ id }) {
		super(`Timed out while waiting for call bundle with id "${id}" to be confirmed.`, { name: "WaitForCallsStatusTimeoutError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/uid.js
var size = 256;
var index = size;
var buffer;
function uid(length = 11) {
	if (!buffer || index + length > size * 2) {
		buffer = "";
		index = 0;
		for (let i = 0; i < size; i++) buffer += (256 + Math.random() * 256 | 0).toString(16).substring(1);
	}
	return buffer.substring(index, index++ + length);
}
//#endregion
//#region node_modules/viem/_esm/clients/createClient.js
function createClient(parameters) {
	const { batch, chain, ccipRead, dataSuffix, key = "base", name = "Base Client", tokens, type = "base" } = parameters;
	const experimental_blockTag = parameters.experimental_blockTag ?? (typeof chain?.experimental_preconfirmationTime === "number" ? "pending" : void 0);
	const blockTime = chain?.blockTime ?? 12e3;
	const defaultPollingInterval = Math.min(Math.max(Math.floor(blockTime / 2), 500), 4e3);
	const pollingInterval = parameters.pollingInterval ?? defaultPollingInterval;
	const cacheTime = parameters.cacheTime ?? pollingInterval;
	const account = parameters.account ? parseAccount(parameters.account) : void 0;
	const { config, request, value } = parameters.transport({
		account,
		chain,
		pollingInterval
	});
	const client = {
		account,
		batch,
		cacheTime,
		ccipRead,
		chain,
		dataSuffix,
		key,
		name,
		pollingInterval,
		request,
		tokens,
		transport: {
			...config,
			...value
		},
		type,
		uid: uid(),
		...experimental_blockTag ? { experimental_blockTag } : {}
	};
	function extend(base) {
		return (extendFn) => {
			const extended = extendFn(base);
			for (const key in client) delete extended[key];
			const combined = {
				...base,
				...extended
			};
			for (const key in extended) {
				const a = base[key];
				const b = extended[key];
				if (isPlainObject(a) && isPlainObject(b)) combined[key] = {
					...a,
					...b
				};
			}
			return Object.assign(combined, { extend: extend(combined) });
		};
	}
	return Object.assign(client, { extend: extend(client) });
}
/** Whether `value` is a plain object (`{}`), as opposed to a function, array,
* or class instance. Used to decide which extension namespaces to merge. */
function isPlainObject(value) {
	if (typeof value !== "object" || value === null) return false;
	const prototype = Object.getPrototypeOf(value);
	return prototype === Object.prototype || prototype === null;
}
/**
* Binds an action function to a `client`, returning a parameter-only version
* along with any helpers the action exposes. Helpers that need a client
* (`.call`, `.calls`, `.callWithPeriod`, `.estimateGas`, `.prepare`,
* `.prepareRecipient`, `.predict`, `.simulate`) are bound to `client`;
* pure helpers (`.extractEvent`, `.extractEvents`) are copied as-is. Used
* by decorators that attach namespaced actions to a Client.
* @internal
*/
function bindActionDecorators(client, action) {
	const wrapped = (parameters = {}) => action(client, parameters);
	for (const key of [
		"call",
		"calls",
		"callWithPeriod",
		"estimateGas",
		"prepare",
		"prepareRecipient",
		"predict",
		"simulate"
	]) if (Object.hasOwn(action, key)) {
		const helper = action[key];
		wrapped[key] = (args = {}) => {
			if (helper.length === 1) return helper(args);
			return helper(client, args);
		};
	}
	for (const key of ["extractEvent", "extractEvents"]) if (Object.hasOwn(action, key)) wrapped[key] = action[key];
	return wrapped;
}
//#endregion
//#region node_modules/viem/_esm/utils/ens/errors.js
function isNullUniversalResolverError(err) {
	if (!(err instanceof BaseError)) return false;
	const cause = err.walk((e) => e instanceof ContractFunctionRevertedError);
	if (!(cause instanceof ContractFunctionRevertedError)) return false;
	if (cause.data?.errorName === "HttpError") return true;
	if (cause.data?.errorName === "ResolverError") return true;
	if (cause.data?.errorName === "ResolverNotContract") return true;
	if (cause.data?.errorName === "ResolverNotFound") return true;
	if (cause.data?.errorName === "ReverseAddressMismatch") return true;
	if (cause.data?.errorName === "UnsupportedResolverProfile") return true;
	return false;
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/decodeFunctionData.js
function decodeFunctionData(parameters) {
	const { abi, data } = parameters;
	const signature = slice(data, 0, 4);
	const description = abi.find((x) => x.type === "function" && signature === toFunctionSelector(formatAbiItem(x)));
	if (!description) throw new AbiFunctionSignatureNotFoundError(signature, { docsPath: "/docs/contract/decodeFunctionData" });
	return {
		functionName: description.name,
		args: "inputs" in description && description.inputs && description.inputs.length > 0 ? decodeAbiParameters(description.inputs, slice(data, 4)) : void 0
	};
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/encodeErrorResult.js
var docsPath$1 = "/docs/contract/encodeErrorResult";
function encodeErrorResult(parameters) {
	const { abi, errorName, args } = parameters;
	let abiItem = abi[0];
	if (errorName) {
		const item = getAbiItem({
			abi,
			args,
			name: errorName
		});
		if (!item) throw new AbiErrorNotFoundError(errorName, { docsPath: docsPath$1 });
		abiItem = item;
	}
	if (abiItem.type !== "error") throw new AbiErrorNotFoundError(void 0, { docsPath: docsPath$1 });
	const signature = toFunctionSelector(formatAbiItem(abiItem));
	let data = "0x";
	if (args && args.length > 0) {
		if (!abiItem.inputs) throw new AbiErrorInputsNotFoundError(abiItem.name, { docsPath: docsPath$1 });
		data = encodeAbiParameters(abiItem.inputs, args);
	}
	return concatHex([signature, data]);
}
//#endregion
//#region node_modules/viem/_esm/utils/abi/encodeFunctionResult.js
var docsPath = "/docs/contract/encodeFunctionResult";
function encodeFunctionResult(parameters) {
	const { abi, functionName, result } = parameters;
	let abiItem = abi[0];
	if (functionName) {
		const item = getAbiItem({
			abi,
			name: functionName
		});
		if (!item) throw new AbiFunctionNotFoundError(functionName, { docsPath });
		abiItem = item;
	}
	if (abiItem.type !== "function") throw new AbiFunctionNotFoundError(void 0, { docsPath });
	if (!abiItem.outputs) throw new AbiFunctionOutputsNotFoundError(abiItem.name, { docsPath });
	const values = (() => {
		if (abiItem.outputs.length === 0) return [];
		if (abiItem.outputs.length === 1) return [result];
		if (Array.isArray(result)) return result;
		throw new InvalidArrayError(result);
	})();
	return encodeAbiParameters(abiItem.outputs, values);
}
async function localBatchGatewayRequest(parameters) {
	const { data, ccipRequest } = parameters;
	const { args: [queries] } = decodeFunctionData({
		abi: batchGatewayAbi,
		data
	});
	const failures = [];
	const responses = [];
	await Promise.all(queries.map(async (query, i) => {
		try {
			responses[i] = query.urls.includes("x-batch-gateway:true") ? await localBatchGatewayRequest({
				data: query.data,
				ccipRequest
			}) : await ccipRequest(query);
			failures[i] = false;
		} catch (err) {
			failures[i] = true;
			responses[i] = encodeError(err);
		}
	}));
	return encodeFunctionResult({
		abi: batchGatewayAbi,
		functionName: "query",
		result: [failures, responses]
	});
}
function encodeError(error) {
	if (error.name === "HttpRequestError" && error.status) return encodeErrorResult({
		abi: batchGatewayAbi,
		errorName: "HttpError",
		args: [error.status, error.shortMessage]
	});
	return encodeErrorResult({
		abi: [solidityError],
		errorName: "Error",
		args: ["shortMessage" in error ? error.shortMessage : error.message]
	});
}
//#endregion
//#region node_modules/viem/_esm/utils/ens/encodedLabelToLabelhash.js
function encodedLabelToLabelhash(label) {
	if (label.length !== 66) return null;
	if (label.indexOf("[") !== 0) return null;
	if (label.indexOf("]") !== 65) return null;
	const hash = `0x${label.slice(1, 65)}`;
	if (!isHex(hash)) return null;
	return hash;
}
//#endregion
//#region node_modules/viem/_esm/utils/ens/namehash.js
/**
* @description Hashes ENS name
*
* - Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `namehash`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
*
* @example
* namehash('wevm.eth')
* '0x08c85f2f4059e930c45a6aeff9dcd3bd95dc3c5c1cddef6a0626b31152248560'
*
* @link https://eips.ethereum.org/EIPS/eip-137
*/
function namehash(name) {
	let result = (/* @__PURE__ */ new Uint8Array(32)).fill(0);
	if (!name) return bytesToHex(result);
	const labels = name.split(".");
	for (let i = labels.length - 1; i >= 0; i -= 1) {
		const hashFromEncodedLabel = encodedLabelToLabelhash(labels[i]);
		const hashed = hashFromEncodedLabel ? toBytes(hashFromEncodedLabel) : keccak256(stringToBytes(labels[i]), "bytes");
		result = keccak256(concat([result, hashed]), "bytes");
	}
	return bytesToHex(result);
}
//#endregion
//#region node_modules/viem/_esm/utils/ens/encodeLabelhash.js
function encodeLabelhash(hash) {
	return `[${hash.slice(2)}]`;
}
//#endregion
//#region node_modules/viem/_esm/utils/ens/labelhash.js
/**
* @description Hashes ENS label
*
* - Since ENS labels prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS labels](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `labelhash`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
*
* @example
* labelhash('eth')
* '0x4f5b812789fc606be1b3b16908db13fc7a9adf7ca72641f84d75b47069d3d7f0'
*/
function labelhash(label) {
	const result = (/* @__PURE__ */ new Uint8Array(32)).fill(0);
	if (!label) return bytesToHex(result);
	return encodedLabelToLabelhash(label) || keccak256(stringToBytes(label));
}
//#endregion
//#region node_modules/viem/_esm/utils/ens/packetToBytes.js
function packetToBytes(packet) {
	const value = packet.replace(/^\.|\.$/gm, "");
	if (value.length === 0) return /* @__PURE__ */ new Uint8Array(1);
	const bytes = new Uint8Array(stringToBytes(value).byteLength + 2);
	let offset = 0;
	const list = value.split(".");
	for (let i = 0; i < list.length; i++) {
		let encoded = stringToBytes(list[i]);
		if (encoded.byteLength > 255) encoded = stringToBytes(encodeLabelhash(labelhash(list[i])));
		bytes[offset] = encoded.length;
		bytes.set(encoded, offset + 1);
		offset += encoded.length + 1;
	}
	if (bytes.byteLength !== offset + 1) return bytes.slice(0, offset + 1);
	return bytes;
}
//#endregion
//#region node_modules/viem/_esm/actions/ens/getEnsAddress.js
/**
* Gets address for ENS name.
*
* - Docs: https://viem.sh/docs/ens/actions/getEnsAddress
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
*
* Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
*
* Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
*
* @param client - Client to use
* @param parameters - {@link GetEnsAddressParameters}
* @returns Address for ENS name or `null` if not found. {@link GetEnsAddressReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getEnsAddress, normalize } from 'viem/ens'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const ensAddress = await getEnsAddress(client, {
*   name: normalize('wevm.eth'),
* })
* // '0xd2135CfB216b74109775236E36d4b433F1DF507B'
*/
async function getEnsAddress(client, parameters) {
	const { blockNumber, blockTag, coinType, name, gatewayUrls, strict } = parameters;
	const { chain } = client;
	const universalResolverAddress = (() => {
		if (parameters.universalResolverAddress) return parameters.universalResolverAddress;
		if (!chain) throw new Error("client chain not configured. universalResolverAddress is required.");
		return getChainContractAddress({
			blockNumber,
			chain,
			contract: "ensUniversalResolver"
		});
	})();
	const tlds = chain?.ensTlds;
	if (tlds && !tlds.some((tld) => name.endsWith(tld))) return null;
	const args = (() => {
		if (coinType != null) return [namehash(name), BigInt(coinType)];
		return [namehash(name)];
	})();
	try {
		const functionData = encodeFunctionData({
			abi: addressResolverAbi,
			functionName: "addr",
			args
		});
		const readContractParameters = {
			address: universalResolverAddress,
			abi: universalResolverResolveAbi,
			functionName: "resolveWithGateways",
			args: [
				toHex(packetToBytes(name)),
				functionData,
				gatewayUrls ?? ["x-batch-gateway:true"]
			],
			blockNumber,
			blockTag
		};
		const res = await getAction(client, readContract, "readContract")(readContractParameters);
		if (res[0] === "0x") return null;
		const address = decodeAddress({
			coinType,
			data: res[0],
			args
		});
		if (address === "0x") return null;
		if (trim(address) === "0x00") return null;
		return address;
	} catch (err) {
		if (strict) throw err;
		if (isNullUniversalResolverError(err)) return null;
		throw err;
	}
}
function decodeAddress({ coinType, data, args }) {
	try {
		return decodeFunctionResult({
			abi: addressResolverAbi,
			args,
			functionName: "addr",
			data
		});
	} catch (err) {
		if (coinType == null) throw err;
		const address = trim(data);
		if (size$1(address) === 20) return getAddress(address);
		throw err;
	}
}
//#endregion
//#region node_modules/viem/_esm/errors/ens.js
var EnsAvatarInvalidMetadataError = class extends BaseError {
	constructor({ data }) {
		super("Unable to extract image from metadata. The metadata may be malformed or invalid.", {
			metaMessages: [
				"- Metadata must be a JSON object with at least an `image`, `image_url` or `image_data` property.",
				"",
				`Provided data: ${JSON.stringify(data)}`
			],
			name: "EnsAvatarInvalidMetadataError"
		});
	}
};
var EnsAvatarInvalidNftUriError = class extends BaseError {
	constructor({ reason }) {
		super(`ENS NFT avatar URI is invalid. ${reason}`, { name: "EnsAvatarInvalidNftUriError" });
	}
};
var EnsAvatarUriResolutionError = class extends BaseError {
	constructor({ uri }) {
		super(`Unable to resolve ENS avatar URI "${uri}". The URI may be malformed, invalid, or does not respond with a valid image.`, { name: "EnsAvatarUriResolutionError" });
	}
};
var EnsAvatarUnsupportedNamespaceError = class extends BaseError {
	constructor({ namespace }) {
		super(`ENS NFT avatar namespace "${namespace}" is not supported. Must be "erc721" or "erc1155".`, { name: "EnsAvatarUnsupportedNamespaceError" });
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/ens/avatar/utils.js
var networkRegex = /(?<protocol>https?:\/\/[^/]*|ipfs:\/|ipns:\/|ar:\/)?(?<root>\/)?(?<subpath>ipfs\/|ipns\/)?(?<target>[\w\-.]+)(?<subtarget>\/.*)?/;
var ipfsHashRegex = /^(Qm[1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,})(\/(?<target>[\w\-.]+))?(?<subtarget>\/.*)?$/;
var base64Regex = /^data:([a-zA-Z\-/+]*);base64,([^"].*)/;
var dataURIRegex = /^data:([a-zA-Z\-/+]*)?(;[a-zA-Z0-9].*?)?(,)/;
/** @internal */
async function isImageUri(uri) {
	try {
		const res = await fetch(uri, { method: "HEAD" });
		if (res.status === 200) return res.headers.get("content-type")?.startsWith("image/");
		return false;
	} catch (error) {
		if (typeof error === "object" && typeof error.response !== "undefined") return false;
		if (!Object.hasOwn(globalThis, "Image")) return false;
		return new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				resolve(true);
			};
			img.onerror = () => {
				resolve(false);
			};
			img.src = uri;
		});
	}
}
/** @internal */
function getGateway(custom, defaultGateway) {
	if (!custom) return defaultGateway;
	if (custom.endsWith("/")) return custom.slice(0, -1);
	return custom;
}
function resolveAvatarUri({ uri, gatewayUrls }) {
	const isEncoded = base64Regex.test(uri);
	if (isEncoded) return {
		uri,
		isOnChain: true,
		isEncoded
	};
	const ipfsGateway = getGateway(gatewayUrls?.ipfs, "https://ipfs.io");
	const arweaveGateway = getGateway(gatewayUrls?.arweave, "https://arweave.net");
	const { protocol, subpath, target, subtarget = "" } = uri.match(networkRegex)?.groups || {};
	const isIPNS = protocol === "ipns:/" || subpath === "ipns/";
	const isIPFS = protocol === "ipfs:/" || subpath === "ipfs/" || ipfsHashRegex.test(uri);
	if (uri.startsWith("http") && !isIPNS && !isIPFS) {
		let replacedUri = uri;
		if (gatewayUrls?.arweave) replacedUri = uri.replace(/https:\/\/arweave.net/g, gatewayUrls?.arweave);
		return {
			uri: replacedUri,
			isOnChain: false,
			isEncoded: false
		};
	}
	if ((isIPNS || isIPFS) && target) return {
		uri: `${ipfsGateway}/${isIPNS ? "ipns" : "ipfs"}/${target}${subtarget}`,
		isOnChain: false,
		isEncoded: false
	};
	if (protocol === "ar:/" && target) return {
		uri: `${arweaveGateway}/${target}${subtarget || ""}`,
		isOnChain: false,
		isEncoded: false
	};
	let parsedUri = uri.replace(dataURIRegex, "");
	if (parsedUri.startsWith("<svg")) parsedUri = `data:image/svg+xml;base64,${btoa(parsedUri)}`;
	if (parsedUri.startsWith("data:") || parsedUri.startsWith("{")) return {
		uri: parsedUri,
		isOnChain: true,
		isEncoded: false
	};
	throw new EnsAvatarUriResolutionError({ uri });
}
function getJsonImage(data) {
	if (typeof data !== "object" || !("image" in data) && !("image_url" in data) && !("image_data" in data)) throw new EnsAvatarInvalidMetadataError({ data });
	return data.image || data.image_url || data.image_data;
}
async function getMetadataAvatarUri({ gatewayUrls, uri }) {
	try {
		return await parseAvatarUri({
			gatewayUrls,
			uri: getJsonImage(await fetch(uri).then((res) => res.json()))
		});
	} catch {
		throw new EnsAvatarUriResolutionError({ uri });
	}
}
async function parseAvatarUri({ gatewayUrls, uri }) {
	const { uri: resolvedURI, isOnChain } = resolveAvatarUri({
		uri,
		gatewayUrls
	});
	if (isOnChain) return resolvedURI;
	if (await isImageUri(resolvedURI)) return resolvedURI;
	throw new EnsAvatarUriResolutionError({ uri });
}
function parseNftUri(uri_) {
	let uri = uri_;
	if (uri.startsWith("did:nft:")) uri = uri.replace("did:nft:", "").replace(/_/g, "/");
	const [reference, asset_namespace, tokenID] = uri.split("/");
	const [eip_namespace, chainID] = reference.split(":");
	const [erc_namespace, contractAddress] = asset_namespace.split(":");
	if (!eip_namespace || eip_namespace.toLowerCase() !== "eip155") throw new EnsAvatarInvalidNftUriError({ reason: "Only EIP-155 supported" });
	if (!chainID) throw new EnsAvatarInvalidNftUriError({ reason: "Chain ID not found" });
	if (!contractAddress) throw new EnsAvatarInvalidNftUriError({ reason: "Contract address not found" });
	if (!tokenID) throw new EnsAvatarInvalidNftUriError({ reason: "Token ID not found" });
	if (!erc_namespace) throw new EnsAvatarInvalidNftUriError({ reason: "ERC namespace not found" });
	return {
		chainID: Number.parseInt(chainID, 10),
		namespace: erc_namespace.toLowerCase(),
		contractAddress,
		tokenID
	};
}
async function getNftTokenUri(client, { nft }) {
	if (nft.namespace === "erc721") return readContract(client, {
		address: nft.contractAddress,
		abi: [{
			name: "tokenURI",
			type: "function",
			stateMutability: "view",
			inputs: [{
				name: "tokenId",
				type: "uint256"
			}],
			outputs: [{
				name: "",
				type: "string"
			}]
		}],
		functionName: "tokenURI",
		args: [BigInt(nft.tokenID)]
	});
	if (nft.namespace === "erc1155") return readContract(client, {
		address: nft.contractAddress,
		abi: [{
			name: "uri",
			type: "function",
			stateMutability: "view",
			inputs: [{
				name: "_id",
				type: "uint256"
			}],
			outputs: [{
				name: "",
				type: "string"
			}]
		}],
		functionName: "uri",
		args: [BigInt(nft.tokenID)]
	});
	throw new EnsAvatarUnsupportedNamespaceError({ namespace: nft.namespace });
}
//#endregion
//#region node_modules/viem/_esm/utils/ens/avatar/parseAvatarRecord.js
async function parseAvatarRecord(client, { gatewayUrls, record }) {
	if (/eip155:/i.test(record)) return parseNftAvatarUri(client, {
		gatewayUrls,
		record
	});
	return parseAvatarUri({
		uri: record,
		gatewayUrls
	});
}
async function parseNftAvatarUri(client, { gatewayUrls, record }) {
	const nft = parseNftUri(record);
	const { uri: resolvedNftUri, isOnChain, isEncoded } = resolveAvatarUri({
		uri: await getNftTokenUri(client, { nft }),
		gatewayUrls
	});
	if (isOnChain && (resolvedNftUri.includes("data:application/json;base64,") || resolvedNftUri.startsWith("{"))) {
		const encodedJson = isEncoded ? atob(resolvedNftUri.replace("data:application/json;base64,", "")) : resolvedNftUri;
		return parseAvatarUri({
			uri: getJsonImage(JSON.parse(encodedJson)),
			gatewayUrls
		});
	}
	let uriTokenId = nft.tokenID;
	if (nft.namespace === "erc1155") uriTokenId = uriTokenId.replace("0x", "").padStart(64, "0");
	return getMetadataAvatarUri({
		gatewayUrls,
		uri: resolvedNftUri.replace(/(?:0x)?{id}/, uriTokenId)
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/ens/getEnsText.js
/**
* Gets a text record for specified ENS name.
*
* - Docs: https://viem.sh/docs/ens/actions/getEnsResolver
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
*
* Calls `resolve(bytes, bytes)` on ENS Universal Resolver Contract.
*
* Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
*
* @param client - Client to use
* @param parameters - {@link GetEnsTextParameters}
* @returns Address for ENS resolver. {@link GetEnsTextReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getEnsText, normalize } from 'viem/ens'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const twitterRecord = await getEnsText(client, {
*   name: normalize('wevm.eth'),
*   key: 'com.twitter',
* })
* // 'wevm_dev'
*/
async function getEnsText(client, parameters) {
	const { blockNumber, blockTag, key, name, gatewayUrls, strict } = parameters;
	const { chain } = client;
	const universalResolverAddress = (() => {
		if (parameters.universalResolverAddress) return parameters.universalResolverAddress;
		if (!chain) throw new Error("client chain not configured. universalResolverAddress is required.");
		return getChainContractAddress({
			blockNumber,
			chain,
			contract: "ensUniversalResolver"
		});
	})();
	const tlds = chain?.ensTlds;
	if (tlds && !tlds.some((tld) => name.endsWith(tld))) return null;
	try {
		const readContractParameters = {
			address: universalResolverAddress,
			abi: universalResolverResolveAbi,
			args: [
				toHex(packetToBytes(name)),
				encodeFunctionData({
					abi: textResolverAbi,
					functionName: "text",
					args: [namehash(name), key]
				}),
				gatewayUrls ?? ["x-batch-gateway:true"]
			],
			functionName: "resolveWithGateways",
			blockNumber,
			blockTag
		};
		const res = await getAction(client, readContract, "readContract")(readContractParameters);
		if (res[0] === "0x") return null;
		const record = decodeFunctionResult({
			abi: textResolverAbi,
			functionName: "text",
			data: res[0]
		});
		return record === "" ? null : record;
	} catch (err) {
		if (strict) throw err;
		if (isNullUniversalResolverError(err)) return null;
		throw err;
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/ens/getEnsAvatar.js
/**
* Gets the avatar of an ENS name.
*
* - Docs: https://viem.sh/docs/ens/actions/getEnsAvatar
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
*
* Calls [`getEnsText`](https://viem.sh/docs/ens/actions/getEnsText) with `key` set to `'avatar'`.
*
* Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
*
* @param client - Client to use
* @param parameters - {@link GetEnsAvatarParameters}
* @returns Avatar URI or `null` if not found. {@link GetEnsAvatarReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getEnsAvatar, normalize } from 'viem/ens'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const ensAvatar = await getEnsAvatar(client, {
*   name: normalize('wevm.eth'),
* })
* // 'https://ipfs.io/ipfs/Qma8mnp6xV3J2cRNf3mTth5C8nV11CAnceVinc3y8jSbio'
*/
async function getEnsAvatar(client, { blockNumber, blockTag, assetGatewayUrls, name, gatewayUrls, strict, universalResolverAddress }) {
	const record = await getAction(client, getEnsText, "getEnsText")({
		blockNumber,
		blockTag,
		key: "avatar",
		name,
		universalResolverAddress,
		gatewayUrls,
		strict
	});
	if (!record) return null;
	try {
		return await parseAvatarRecord(client, {
			record,
			gatewayUrls: assetGatewayUrls
		});
	} catch {
		return null;
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/ens/getEnsName.js
/**
* Gets primary name for specified address.
*
* - Docs: https://viem.sh/docs/ens/actions/getEnsName
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
*
* Calls `reverse(bytes)` on ENS Universal Resolver Contract to "reverse resolve" the address to the primary ENS name.
*
* @param client - Client to use
* @param parameters - {@link GetEnsNameParameters}
* @returns Name or `null` if not found. {@link GetEnsNameReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getEnsName } from 'viem/ens'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const ensName = await getEnsName(client, {
*   address: '0xd2135CfB216b74109775236E36d4b433F1DF507B',
* })
* // 'wevm.eth'
*/
async function getEnsName(client, parameters) {
	const { address, blockNumber, blockTag, coinType = 60n, gatewayUrls, strict } = parameters;
	const { chain } = client;
	const universalResolverAddress = (() => {
		if (parameters.universalResolverAddress) return parameters.universalResolverAddress;
		if (!chain) throw new Error("client chain not configured. universalResolverAddress is required.");
		return getChainContractAddress({
			blockNumber,
			chain,
			contract: "ensUniversalResolver"
		});
	})();
	try {
		const readContractParameters = {
			address: universalResolverAddress,
			abi: universalResolverReverseAbi,
			args: [
				address,
				coinType,
				gatewayUrls ?? ["x-batch-gateway:true"]
			],
			functionName: "reverseWithGateways",
			blockNumber,
			blockTag
		};
		const [name] = await getAction(client, readContract, "readContract")(readContractParameters);
		return name || null;
	} catch (err) {
		if (strict) throw err;
		if (isNullUniversalResolverError(err)) return null;
		throw err;
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/ens/getEnsResolver.js
/**
* Gets resolver for ENS name.
*
* - Docs: https://viem.sh/docs/ens/actions/getEnsResolver
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/ens
*
* Calls `findResolver(bytes)` on ENS Universal Resolver Contract to retrieve the resolver of an ENS name.
*
* Since ENS names prohibit certain forbidden characters (e.g. underscore) and have other validation rules, you likely want to [normalize ENS names](https://docs.ens.domains/contract-api-reference/name-processing#normalising-names) with [UTS-46 normalization](https://unicode.org/reports/tr46) before passing them to `getEnsAddress`. You can use the built-in [`normalize`](https://viem.sh/docs/ens/utilities/normalize) function for this.
*
* @param client - Client to use
* @param parameters - {@link GetEnsResolverParameters}
* @returns Address for ENS resolver. {@link GetEnsResolverReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getEnsResolver, normalize } from 'viem/ens'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const resolverAddress = await getEnsResolver(client, {
*   name: normalize('wevm.eth'),
* })
* // '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41'
*/
async function getEnsResolver(client, parameters) {
	const { blockNumber, blockTag, name } = parameters;
	const { chain } = client;
	const universalResolverAddress = (() => {
		if (parameters.universalResolverAddress) return parameters.universalResolverAddress;
		if (!chain) throw new Error("client chain not configured. universalResolverAddress is required.");
		return getChainContractAddress({
			blockNumber,
			chain,
			contract: "ensUniversalResolver"
		});
	})();
	const tlds = chain?.ensTlds;
	if (tlds && !tlds.some((tld) => name.endsWith(tld))) throw new Error(`${name} is not a valid ENS TLD (${tlds?.join(", ")}) for chain "${chain.name}" (id: ${chain.id}).`);
	const [resolverAddress] = await getAction(client, readContract, "readContract")({
		address: universalResolverAddress,
		abi: [{
			inputs: [{ type: "bytes" }],
			name: "findResolver",
			outputs: [
				{ type: "address" },
				{ type: "bytes32" },
				{ type: "uint256" }
			],
			stateMutability: "view",
			type: "function"
		}],
		functionName: "findResolver",
		args: [toHex(packetToBytes(name))],
		blockNumber,
		blockTag
	});
	return resolverAddress;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/createAccessList.js
/**
* Creates an EIP-2930 access list.
*
* - Docs: https://viem.sh/docs/actions/public/createAccessList
* - JSON-RPC Methods: `eth_createAccessList`
*
* @param client - Client to use
* @param parameters - {@link CreateAccessListParameters}
* @returns The access list. {@link CreateAccessListReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createAccessList } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const data = await createAccessList(client, {
*   account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266',
*   data: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
*   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
* })
*/
async function createAccessList(client, args) {
	const { account: account_ = client.account, blockNumber, blockTag = "latest", blobs, data, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, to, value, ...rest } = args;
	const account = account_ ? parseAccount(account_) : void 0;
	try {
		assertRequest(args);
		const block = (typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0) || blockTag;
		const chainFormat = client.chain?.formatters?.transactionRequest?.format;
		const request = (chainFormat || formatTransactionRequest)({
			...extract(rest, { format: chainFormat }),
			account,
			blobs,
			data,
			gas,
			gasPrice,
			maxFeePerBlobGas,
			maxFeePerGas,
			maxPriorityFeePerGas,
			to,
			value
		}, "createAccessList");
		const response = await client.request({
			method: "eth_createAccessList",
			params: [request, block]
		});
		if (response.error) throw new BaseError(response.error, { details: response.error });
		return {
			accessList: response.accessList,
			gasUsed: BigInt(response.gasUsed)
		};
	} catch (err) {
		throw getCallError(err, {
			...args,
			account,
			chain: client.chain
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/public/createBlockFilter.js
/**
* Creates a [`Filter`](https://viem.sh/docs/glossary/types#filter) to listen for new block hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
*
* - Docs: https://viem.sh/docs/actions/public/createBlockFilter
* - JSON-RPC Methods: [`eth_newBlockFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newBlockFilter)
*
* @param client - Client to use
* @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateBlockFilterReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createBlockFilter } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createBlockFilter(client)
* // { id: "0x345a6572337856574a76364e457a4366", type: 'block' }
*/
async function createBlockFilter(client) {
	const getRequest = createFilterRequestScope(client, { method: "eth_newBlockFilter" });
	const id = await client.request({ method: "eth_newBlockFilter" });
	return {
		id,
		request: getRequest(id),
		type: "block"
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/public/createEventFilter.js
/**
* Creates a [`Filter`](https://viem.sh/docs/glossary/types#filter) to listen for new events that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
*
* - Docs: https://viem.sh/docs/actions/public/createEventFilter
* - JSON-RPC Methods: [`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter)
*
* @param client - Client to use
* @param parameters - {@link CreateEventFilterParameters}
* @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateEventFilterReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createEventFilter } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createEventFilter(client, {
*   address: '0xfba3912ca04dd458c843e2ee08967fc04f3579c2',
* })
*/
async function createEventFilter(client, { address, args, event, events: events_, fromBlock, strict, toBlock } = {}) {
	const events = events_ ?? (event ? [event] : void 0);
	const getRequest = createFilterRequestScope(client, { method: "eth_newFilter" });
	let topics = [];
	if (events) {
		topics = [events.flatMap((event) => encodeEventTopics({
			abi: [event],
			eventName: event.name,
			args
		}))];
		if (event) topics = topics[0];
	}
	const id = await client.request({
		method: "eth_newFilter",
		params: [{
			address,
			fromBlock: typeof fromBlock === "bigint" ? numberToHex(fromBlock) : fromBlock,
			toBlock: typeof toBlock === "bigint" ? numberToHex(toBlock) : toBlock,
			...topics.length ? { topics } : {}
		}]
	});
	return {
		abi: events,
		args,
		eventName: event ? event.name : void 0,
		fromBlock,
		id,
		request: getRequest(id),
		strict: Boolean(strict),
		toBlock,
		type: "event"
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/public/createPendingTransactionFilter.js
/**
* Creates a Filter to listen for new pending transaction hashes that can be used with [`getFilterChanges`](https://viem.sh/docs/actions/public/getFilterChanges).
*
* - Docs: https://viem.sh/docs/actions/public/createPendingTransactionFilter
* - JSON-RPC Methods: [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter)
*
* @param client - Client to use
* @returns [`Filter`](https://viem.sh/docs/glossary/types#filter). {@link CreateBlockFilterReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createPendingTransactionFilter } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createPendingTransactionFilter(client)
* // { id: "0x345a6572337856574a76364e457a4366", type: 'transaction' }
*/
async function createPendingTransactionFilter(client) {
	const getRequest = createFilterRequestScope(client, { method: "eth_newPendingTransactionFilter" });
	const id = await client.request({ method: "eth_newPendingTransactionFilter" });
	return {
		id,
		request: getRequest(id),
		type: "transaction"
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getBalance.js
/**
* Returns the balance of an address in wei.
*
* - Docs: https://viem.sh/docs/actions/public/getBalance
* - JSON-RPC Methods: [`eth_getBalance`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getbalance)
*
* You can convert the balance to ether units with [`formatEther`](https://viem.sh/docs/utilities/formatEther).
*
* ```ts
* const balance = await getBalance(client, {
*   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   blockTag: 'safe'
* })
* const balanceAsEther = formatEther(balance)
* // "6.942"
* ```
*
* @param client - Client to use
* @param parameters - {@link GetBalanceParameters}
* @returns The balance of the address in wei. {@link GetBalanceReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getBalance } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const balance = await getBalance(client, {
*   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
* })
* // 10000000000000000000000n (wei)
*/
async function getBalance$1(client, { address, blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest", requireCanonical }) {
	const block = formatBlockParameter({
		blockHash,
		blockNumber,
		blockTag,
		requireCanonical
	});
	if (client.batch?.multicall && client.chain?.contracts?.multicall3) {
		const multicall3Address = client.chain.contracts.multicall3.address;
		const calldata = encodeFunctionData({
			abi: multicall3Abi,
			functionName: "getEthBalance",
			args: [address]
		});
		const { data } = await getAction(client, call, "call")({
			to: multicall3Address,
			data: calldata,
			blockHash,
			blockNumber,
			blockTag,
			requireCanonical
		});
		return decodeFunctionResult({
			abi: multicall3Abi,
			functionName: "getEthBalance",
			args: [address],
			data: data || "0x"
		});
	}
	const balance = await client.request({
		method: "eth_getBalance",
		params: [address, block]
	});
	return BigInt(balance);
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getBlobBaseFee.js
/**
* Returns the base fee per blob gas in wei.
*
* - Docs: https://viem.sh/docs/actions/public/getBlobBaseFee
* - JSON-RPC Methods: [`eth_blobBaseFee`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blobBaseFee)
*
* @param client - Client to use
* @returns The blob base fee (in wei). {@link GetBlobBaseFeeReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getBlobBaseFee } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const blobBaseFee = await getBlobBaseFee(client)
*/
async function getBlobBaseFee(client) {
	const baseFee = await client.request({ method: "eth_blobBaseFee" });
	return BigInt(baseFee);
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getBlockReceipts.js
/**
* Returns the transaction receipts of a block at a block number, hash, or tag.
*
* - Docs: https://viem.sh/docs/actions/public/getBlockReceipts
* - JSON-RPC Methods: [`eth_getBlockReceipts`](https://ethereum.github.io/execution-apis/api/methods/eth_getBlockReceipts/)
*
* @param client - Client to use
* @param parameters - {@link GetBlockReceiptsParameters}
* @returns The transaction receipts. {@link GetBlockReceiptsReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getBlockReceipts } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const receipts = await getBlockReceipts(client, {
*   blockNumber: 69420n,
* })
*/
async function getBlockReceipts(client, { blockHash, blockNumber, blockTag = client.experimental_blockTag ?? "latest" } = {}) {
	const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
	const receipts = await client.request({
		method: "eth_getBlockReceipts",
		params: [blockHash || blockNumberHex || blockTag]
	}, { dedupe: Boolean(blockHash || blockNumberHex) });
	if (!receipts) throw new BlockNotFoundError({
		blockHash,
		blockNumber
	});
	const format = client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt;
	return receipts.map((receipt) => format(receipt, "getBlockReceipts"));
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getBlockTransactionCount.js
/**
* Returns the number of Transactions at a block number, hash, or tag.
*
* - Docs: https://viem.sh/docs/actions/public/getBlockTransactionCount
* - JSON-RPC Methods:
*   - Calls [`eth_getBlockTransactionCountByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbynumber) for `blockNumber` & `blockTag`.
*   - Calls [`eth_getBlockTransactionCountByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblocktransactioncountbyhash) for `blockHash`.
*
* @param client - Client to use
* @param parameters - {@link GetBlockTransactionCountParameters}
* @returns The block transaction count. {@link GetBlockTransactionCountReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getBlockTransactionCount } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const count = await getBlockTransactionCount(client)
*/
async function getBlockTransactionCount(client, { blockHash, blockNumber, blockTag = "latest" } = {}) {
	const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
	let count;
	if (blockHash) count = await client.request({
		method: "eth_getBlockTransactionCountByHash",
		params: [blockHash]
	}, { dedupe: true });
	else count = await client.request({
		method: "eth_getBlockTransactionCountByNumber",
		params: [blockNumberHex || blockTag]
	}, { dedupe: Boolean(blockNumberHex) });
	return hexToNumber(count);
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getCode.js
/**
* Retrieves the bytecode at an address.
*
* - Docs: https://viem.sh/docs/contract/getCode
* - JSON-RPC Methods: [`eth_getCode`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getcode)
*
* @param client - Client to use
* @param parameters - {@link GetCodeParameters}
* @returns The contract's bytecode. {@link GetCodeReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getCode } from 'viem/contract'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const code = await getCode(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
* })
*/
async function getCode(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical }) {
	const block = formatBlockParameter({
		blockHash,
		blockNumber,
		blockTag,
		requireCanonical
	});
	const hex = await client.request({
		method: "eth_getCode",
		params: [address, block]
	}, { dedupe: typeof blockNumber === "bigint" || blockHash !== void 0 });
	if (hex === "0x") return void 0;
	return hex;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getDelegation.js
/**
* Returns the address that an account has delegated to via EIP-7702.
*
* - Docs: https://viem.sh/docs/actions/public/getDelegation
*
* @param client - Client to use
* @param parameters - {@link GetDelegationParameters}
* @returns The delegated address, or undefined if not delegated. {@link GetDelegationReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getDelegation } from 'viem/actions'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const delegation = await getDelegation(client, {
*   address: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
* })
*/
async function getDelegation(client, { address, blockNumber, blockTag = "latest" }) {
	const code = await getCode(client, {
		address,
		...blockNumber !== void 0 ? { blockNumber } : { blockTag }
	});
	if (!code) return void 0;
	if (size$1(code) !== 23) return void 0;
	if (!code.startsWith("0xef0100")) return void 0;
	return getAddress(slice(code, 3, 23));
}
//#endregion
//#region node_modules/viem/_esm/errors/eip712.js
var Eip712DomainNotFoundError = class extends BaseError {
	constructor({ address }) {
		super(`No EIP-712 domain found on contract "${address}".`, {
			metaMessages: [
				"Ensure that:",
				`- The contract is deployed at the address "${address}".`,
				"- `eip712Domain()` function exists on the contract.",
				"- `eip712Domain()` function matches signature to ERC-5267 specification."
			],
			name: "Eip712DomainNotFoundError"
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/actions/public/getEip712Domain.js
/**
* Reads the EIP-712 domain from a contract, based on the ERC-5267 specification.
*
* @param client - A {@link Client} instance.
* @param parameters - The parameters of the action. {@link GetEip712DomainParameters}
* @returns The EIP-712 domain, fields, and extensions. {@link GetEip712DomainReturnType}
*
* @example
* ```ts
* import { createPublicClient, http, getEip712Domain } from 'viem'
* import { mainnet } from 'viem/chains'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
*
* const domain = await getEip712Domain(client, {
*   address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
* })
* // {
* //   domain: {
* //     name: 'ExampleContract',
* //     version: '1',
* //     chainId: 1,
* //     verifyingContract: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
* //   },
* //   fields: '0x0f',
* //   extensions: [],
* // }
* ```
*/
async function getEip712Domain(client, parameters) {
	const { address, factory, factoryData } = parameters;
	try {
		const [fields, name, version, chainId, verifyingContract, salt, extensions] = await getAction(client, readContract, "readContract")({
			abi,
			address,
			functionName: "eip712Domain",
			factory,
			factoryData
		});
		return {
			domain: {
				name,
				version,
				chainId: Number(chainId),
				verifyingContract,
				salt
			},
			extensions,
			fields
		};
	} catch (e) {
		const error = e;
		if (error.name === "ContractFunctionExecutionError" && error.cause.name === "ContractFunctionZeroDataError") throw new Eip712DomainNotFoundError({ address });
		throw error;
	}
}
var abi = [{
	inputs: [],
	name: "eip712Domain",
	outputs: [
		{
			name: "fields",
			type: "bytes1"
		},
		{
			name: "name",
			type: "string"
		},
		{
			name: "version",
			type: "string"
		},
		{
			name: "chainId",
			type: "uint256"
		},
		{
			name: "verifyingContract",
			type: "address"
		},
		{
			name: "salt",
			type: "bytes32"
		},
		{
			name: "extensions",
			type: "uint256[]"
		}
	],
	stateMutability: "view",
	type: "function"
}];
//#endregion
//#region node_modules/viem/_esm/utils/formatters/feeHistory.js
function formatFeeHistory(feeHistory) {
	return {
		baseFeePerGas: feeHistory.baseFeePerGas.map((value) => BigInt(value)),
		gasUsedRatio: feeHistory.gasUsedRatio,
		oldestBlock: BigInt(feeHistory.oldestBlock),
		reward: feeHistory.reward?.map((reward) => reward.map((value) => BigInt(value)))
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getFeeHistory.js
/**
* Returns a collection of historical gas information.
*
* - Docs: https://viem.sh/docs/actions/public/getFeeHistory
* - JSON-RPC Methods: [`eth_feeHistory`](https://docs.alchemy.com/reference/eth-feehistory)
*
* @param client - Client to use
* @param parameters - {@link GetFeeHistoryParameters}
* @returns The gas estimate (in wei). {@link GetFeeHistoryReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getFeeHistory } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const feeHistory = await getFeeHistory(client, {
*   blockCount: 4,
*   rewardPercentiles: [25, 75],
* })
*/
async function getFeeHistory(client, { blockCount, blockNumber, blockTag = "latest", rewardPercentiles }) {
	const blockNumberHex = typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0;
	return formatFeeHistory(await client.request({
		method: "eth_feeHistory",
		params: [
			numberToHex(blockCount),
			blockNumberHex || blockTag,
			rewardPercentiles
		]
	}, { dedupe: Boolean(blockNumberHex) }));
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getFilterLogs.js
/**
* Returns a list of event logs since the filter was created.
*
* - Docs: https://viem.sh/docs/actions/public/getFilterLogs
* - JSON-RPC Methods: [`eth_getFilterLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterlogs)
*
* `getFilterLogs` is only compatible with **event filters**.
*
* @param client - Client to use
* @param parameters - {@link GetFilterLogsParameters}
* @returns A list of event logs. {@link GetFilterLogsReturnType}
*
* @example
* import { createPublicClient, http, parseAbiItem } from 'viem'
* import { mainnet } from 'viem/chains'
* import { createEventFilter, getFilterLogs } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const filter = await createEventFilter(client, {
*   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
*   event: parseAbiItem('event Transfer(address indexed, address indexed, uint256)'),
* })
* const logs = await getFilterLogs(client, { filter })
*/
async function getFilterLogs(_client, { filter }) {
	const strict = filter.strict ?? false;
	const formattedLogs = (await filter.request({
		method: "eth_getFilterLogs",
		params: [filter.id]
	})).map((log) => formatLog(log));
	if (!filter.abi) return formattedLogs;
	return parseEventLogs({
		abi: filter.abi,
		logs: formattedLogs,
		strict
	});
}
//#endregion
//#region node_modules/viem/_esm/utils/authorization/verifyAuthorization.js
/**
* Verify that an Authorization object was signed by the provided address.
*
* - Docs {@link https://viem.sh/docs/utilities/verifyAuthorization}
*
* @param parameters - {@link VerifyAuthorizationParameters}
* @returns Whether or not the signature is valid. {@link VerifyAuthorizationReturnType}
*/
async function verifyAuthorization({ address, authorization, signature }) {
	return isAddressEqual(getAddress(address), await recoverAuthorizationAddress({
		authorization,
		signature
	}));
}
//#endregion
//#region node_modules/viem/_esm/utils/promise/withDedupe.js
/** @internal */
var promiseCache = /*#__PURE__*/ new LruMap(8192);
/** Deduplicates in-flight promises. */
function withDedupe(fn, { enabled = true, id }) {
	if (!enabled || !id) return fn();
	if (promiseCache.get(id)) return promiseCache.get(id);
	const promise = fn().finally(() => promiseCache.delete(id));
	promiseCache.set(id, promise);
	return promise;
}
//#endregion
//#region node_modules/viem/_esm/utils/buildRequest.js
function buildRequest(request, options = {}) {
	return async (args, overrideOptions = {}) => {
		const { dedupe = false, methods, retryDelay = 150, retryCount = 3, signal, uid } = {
			...options,
			...overrideOptions
		};
		const { method } = args;
		if (methods?.exclude?.includes(method)) throw new MethodNotSupportedRpcError(/* @__PURE__ */ new Error("method not supported"), { method });
		if (methods?.include && !methods.include.includes(method)) throw new MethodNotSupportedRpcError(/* @__PURE__ */ new Error("method not supported"), { method });
		if (signal?.aborted) throw getAbortError(signal);
		return withDedupe(() => withRetry(async () => {
			try {
				return await request(args, signal ? { signal } : void 0);
			} catch (err_) {
				if (signal?.aborted) throw getAbortError(signal);
				if (isAbortError(err_)) throw err_;
				const err = err_;
				switch (err.code) {
					case ParseRpcError.code: throw new ParseRpcError(err);
					case InvalidRequestRpcError.code: throw new InvalidRequestRpcError(err);
					case MethodNotFoundRpcError.code: throw new MethodNotFoundRpcError(err, { method: args.method });
					case InvalidParamsRpcError.code: throw new InvalidParamsRpcError(err);
					case InternalRpcError.code: throw new InternalRpcError(err);
					case InvalidInputRpcError.code: throw new InvalidInputRpcError(err);
					case ResourceNotFoundRpcError.code: throw new ResourceNotFoundRpcError(err);
					case ResourceUnavailableRpcError.code: throw new ResourceUnavailableRpcError(err);
					case TransactionRejectedRpcError.code: throw new TransactionRejectedRpcError(err);
					case MethodNotSupportedRpcError.code: throw new MethodNotSupportedRpcError(err, { method: args.method });
					case LimitExceededRpcError.code: throw new LimitExceededRpcError(err);
					case JsonRpcVersionUnsupportedError.code: throw new JsonRpcVersionUnsupportedError(err);
					case UserRejectedRequestError.code: throw new UserRejectedRequestError(err);
					case UnauthorizedProviderError.code: throw new UnauthorizedProviderError(err);
					case UnsupportedProviderMethodError.code: throw new UnsupportedProviderMethodError(err);
					case ProviderDisconnectedError.code: throw new ProviderDisconnectedError(err);
					case ChainDisconnectedError.code: throw new ChainDisconnectedError(err);
					case SwitchChainError.code: throw new SwitchChainError(err);
					case UnsupportedNonOptionalCapabilityError.code: throw new UnsupportedNonOptionalCapabilityError(err);
					case UnsupportedChainIdError.code: throw new UnsupportedChainIdError(err);
					case DuplicateIdError.code: throw new DuplicateIdError(err);
					case UnknownBundleIdError.code: throw new UnknownBundleIdError(err);
					case BundleTooLargeError.code: throw new BundleTooLargeError(err);
					case AtomicReadyWalletRejectedUpgradeError.code: throw new AtomicReadyWalletRejectedUpgradeError(err);
					case AtomicityNotSupportedError.code: throw new AtomicityNotSupportedError(err);
					case 5e3: throw new UserRejectedRequestError(err);
					case WalletConnectSessionSettlementError.code: throw new WalletConnectSessionSettlementError(err);
					default:
						if (err_ instanceof BaseError) throw err_;
						throw new UnknownRpcError(err);
				}
			}
		}, {
			delay: ({ count, error }) => {
				if (error && error instanceof HttpRequestError) {
					const retryAfter = error?.headers?.get("Retry-After");
					if (retryAfter?.match(/\d/)) return Number.parseInt(retryAfter, 10) * 1e3;
				}
				return ~~(1 << count) * retryDelay;
			},
			retryCount,
			signal,
			shouldRetry: ({ error }) => shouldRetry(error)
		}), {
			enabled: dedupe,
			id: dedupe ? hashString(`${uid}.${stringify(args)}`) : void 0
		});
	};
}
/** @internal */
function shouldRetry(error) {
	if (isAbortError(error)) return false;
	if ("code" in error && typeof error.code === "number") {
		if (error.code === -1) return true;
		if (error.code === LimitExceededRpcError.code) return true;
		if (error.code === InternalRpcError.code) return true;
		if (error.code === 429) return true;
		if (error.code === -32007) return true;
		return false;
	}
	if (error instanceof HttpRequestError && error.status) {
		if (error.status === 403) return true;
		if (error.status === 408) return true;
		if (error.status === 413) return true;
		if (error.status === 429) return true;
		if (error.status === 500) return true;
		if (error.status === 502) return true;
		if (error.status === 503) return true;
		if (error.status === 504) return true;
		return false;
	}
	return true;
}
/** @internal cyrb53 – fast, non-cryptographic 53-bit string hash */
function hashString(str, seed = 0) {
	let h1 = 3735928559 ^ seed;
	let h2 = 1103547991 ^ seed;
	for (let i = 0; i < str.length; i++) {
		const ch = str.charCodeAt(i);
		h1 = Math.imul(h1 ^ ch, 2654435761);
		h2 = Math.imul(h2 ^ ch, 1597334677);
	}
	h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507);
	h1 ^= Math.imul(h2 ^ h2 >>> 16, 3266489909);
	h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507);
	h2 ^= Math.imul(h1 ^ h1 >>> 16, 3266489909);
	return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}
//#endregion
//#region node_modules/viem/_esm/errors/ccip.js
var OffchainLookupError = class extends BaseError {
	constructor({ callbackSelector, cause, data, extraData, sender, urls }) {
		super(cause.shortMessage || "An error occurred while fetching for an offchain result.", {
			cause,
			metaMessages: [
				...cause.metaMessages || [],
				cause.metaMessages?.length ? "" : [],
				"Offchain Gateway Call:",
				urls && ["  Gateway URL(s):", ...urls.map((url) => `    ${getUrl(url)}`)],
				`  Sender: ${sender}`,
				`  Data: ${data}`,
				`  Callback selector: ${callbackSelector}`,
				`  Extra data: ${extraData}`
			].flat(),
			name: "OffchainLookupError"
		});
	}
};
var OffchainLookupResponseMalformedError = class extends BaseError {
	constructor({ result, url }) {
		super("Offchain gateway response is malformed. Response data must be a hex value.", {
			metaMessages: [`Gateway URL: ${getUrl(url)}`, `Response: ${stringify(result)}`],
			name: "OffchainLookupResponseMalformedError"
		});
	}
};
var OffchainLookupSenderMismatchError = class extends BaseError {
	constructor({ sender, to }) {
		super("Reverted sender address does not match target contract address (`to`).", {
			metaMessages: [`Contract address: ${to}`, `OffchainLookup sender address: ${sender}`],
			name: "OffchainLookupSenderMismatchError"
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/ccip.js
var ccip_exports = /* @__PURE__ */ __exportAll({
	ccipRequest: () => ccipRequest,
	offchainLookup: () => offchainLookup,
	offchainLookupAbiItem: () => offchainLookupAbiItem,
	offchainLookupSignature: () => offchainLookupSignature
});
var offchainLookupSignature = "0x556f1830";
var offchainLookupAbiItem = {
	name: "OffchainLookup",
	type: "error",
	inputs: [
		{
			name: "sender",
			type: "address"
		},
		{
			name: "urls",
			type: "string[]"
		},
		{
			name: "callData",
			type: "bytes"
		},
		{
			name: "callbackFunction",
			type: "bytes4"
		},
		{
			name: "extraData",
			type: "bytes"
		}
	]
};
async function offchainLookup(client, { blockNumber, blockTag, data, requestOptions, to }) {
	const { args } = decodeErrorResult({
		data,
		abi: [offchainLookupAbiItem]
	});
	const [sender, urls, callData, callbackSelector, extraData] = args;
	const { ccipRead } = client;
	const ccipRequest_ = ccipRead && typeof ccipRead?.request === "function" ? ccipRead.request : ccipRequest;
	try {
		if (!isAddressEqual(to, sender)) throw new OffchainLookupSenderMismatchError({
			sender,
			to
		});
		const { data: data_ } = await call(client, {
			blockNumber,
			blockTag,
			data: concat([callbackSelector, encodeAbiParameters([{ type: "bytes" }, { type: "bytes" }], [urls.includes("x-batch-gateway:true") ? await localBatchGatewayRequest({
				data: callData,
				ccipRequest: (parameters) => ccipRequest_({
					...parameters,
					requestOptions
				})
			}) : await ccipRequest_({
				data: callData,
				requestOptions,
				sender,
				urls
			}), extraData])]),
			requestOptions,
			to
		});
		return data_;
	} catch (err) {
		if (requestOptions?.signal?.aborted) throw getAbortError(requestOptions.signal);
		if (isAbortError(err)) throw err;
		throw new OffchainLookupError({
			callbackSelector,
			cause: err,
			data,
			extraData,
			sender,
			urls
		});
	}
}
async function ccipRequest({ data, requestOptions, sender, urls }) {
	let error = /* @__PURE__ */ new Error("An unknown error occurred.");
	for (let i = 0; i < urls.length; i++) {
		if (requestOptions?.signal?.aborted) throw getAbortError(requestOptions.signal);
		const url = urls[i];
		const method = url.includes("{data}") ? "GET" : "POST";
		const body = method === "POST" ? {
			data,
			sender
		} : void 0;
		const headers = method === "POST" ? { "Content-Type": "application/json" } : {};
		try {
			const response = await fetch(url.replace("{sender}", sender.toLowerCase()).replace("{data}", data), {
				body: JSON.stringify(body),
				headers,
				method,
				...requestOptions?.signal ? { signal: requestOptions.signal } : {}
			});
			let result;
			if (response.headers.get("Content-Type")?.startsWith("application/json")) result = (await response.json()).data;
			else result = await response.text();
			if (!response.ok) {
				error = new HttpRequestError({
					body,
					details: result?.error ? stringify(result.error) : response.statusText,
					headers: response.headers,
					status: response.status,
					url
				});
				continue;
			}
			if (!isHex(result)) {
				error = new OffchainLookupResponseMalformedError({
					result,
					url
				});
				continue;
			}
			return result;
		} catch (err) {
			if (requestOptions?.signal?.aborted) throw getAbortError(requestOptions.signal);
			if (isAbortError(err)) throw err;
			error = new HttpRequestError({
				body,
				details: err.message,
				url
			});
		}
	}
	throw error;
}
//#endregion
//#region node_modules/viem/_esm/utils/chain/defineChain.js
function defineChain(chain) {
	const chainInstance = {
		formatters: void 0,
		fees: void 0,
		serializers: void 0,
		...chain
	};
	function extend(base) {
		return (fnOrExtended) => {
			const properties = typeof fnOrExtended === "function" ? fnOrExtended(base) : fnOrExtended;
			const combined = {
				...base,
				...properties
			};
			return Object.assign(combined, { extend: extend(combined) });
		};
	}
	return Object.assign(chainInstance, { extend: extend(chainInstance) });
}
//#endregion
//#region node_modules/viem/_esm/utils/promise/withTimeout.js
function withTimeout(fn, { errorInstance = /* @__PURE__ */ new Error("timed out"), timeout, signal }) {
	return new Promise((resolve, reject) => {
		(async () => {
			let timeoutId;
			const controller = new AbortController();
			try {
				if (timeout > 0) timeoutId = setTimeout(() => {
					if (signal) controller.abort();
					else reject(errorInstance);
				}, timeout);
				resolve(await fn({ signal: controller?.signal || null }));
			} catch (err) {
				if (controller?.signal.aborted && isAbortError(err)) {
					reject(errorInstance);
					return;
				}
				reject(err);
			} finally {
				clearTimeout(timeoutId);
			}
		})();
	});
}
//#endregion
//#region node_modules/viem/_esm/utils/rpc/id.js
function createIdStore() {
	return {
		current: 0,
		take() {
			return this.current++;
		},
		reset() {
			this.current = 0;
		}
	};
}
var idCache = /*#__PURE__*/ createIdStore();
//#endregion
//#region node_modules/viem/_esm/utils/rpc/http.js
var defaultMaxResponseBodySize = 10485760;
function getHttpRpcClient(url_, options = {}) {
	const { url, headers: headers_url } = parseUrl(url_);
	return { async request(params) {
		const { body, fetchFn = options.fetchFn ?? fetch, maxResponseBodySize = options.maxResponseBodySize ?? defaultMaxResponseBodySize, onRequest = options.onRequest, onResponse = options.onResponse, timeout = options.timeout ?? 1e4 } = params;
		const fetchOptions = {
			...options.fetchOptions ?? {},
			...params.fetchOptions ?? {}
		};
		const { headers, method, signal: signal_ } = fetchOptions;
		try {
			const response = await withTimeout(async ({ signal }) => {
				const init = {
					...fetchOptions,
					body: Array.isArray(body) ? stringify(body.map((body) => ({
						jsonrpc: "2.0",
						id: body.id ?? idCache.take(),
						...body
					}))) : stringify({
						jsonrpc: "2.0",
						id: body.id ?? idCache.take(),
						...body
					}),
					headers: {
						...headers_url,
						"Content-Type": "application/json",
						...headers
					},
					method: method || "POST",
					signal: signal_ || (timeout > 0 ? signal : null)
				};
				const request = new Request(url, init);
				const args = await onRequest?.(request, init) ?? {
					...init,
					url
				};
				return await fetchFn(args.url ?? url, args);
			}, {
				errorInstance: new TimeoutError({
					body,
					url
				}),
				timeout,
				signal: true
			});
			if (onResponse) await onResponse(response);
			let data;
			const responseBody = await readResponseBody(response, { maxResponseBodySize });
			if (response.headers.get("Content-Type")?.startsWith("application/json")) data = JSON.parse(responseBody);
			else {
				data = responseBody;
				try {
					data = JSON.parse(data || "{}");
				} catch (err) {
					if (response.ok) throw err;
					data = { error: data };
				}
			}
			if (!response.ok) {
				if (typeof data.error?.code === "number" && typeof data.error?.message === "string") return data;
				throw new HttpRequestError({
					body,
					details: stringify(data.error) || response.statusText,
					headers: response.headers,
					status: response.status,
					url
				});
			}
			return data;
		} catch (err) {
			if (signal_?.aborted) throw getAbortError(signal_);
			if (isAbortError(err)) throw err;
			if (err instanceof HttpRequestError) throw err;
			if (err instanceof ResponseBodyTooLargeError) throw err;
			if (err instanceof TimeoutError) throw err;
			throw new HttpRequestError({
				body,
				cause: err,
				url
			});
		}
	} };
}
async function readResponseBody(response, { maxResponseBodySize }) {
	if (maxResponseBodySize === false) return response.text();
	const contentLength = response.headers.get("Content-Length");
	if (contentLength) {
		const size = Number(contentLength);
		if (size > maxResponseBodySize) throw new ResponseBodyTooLargeError({
			maxSize: maxResponseBodySize,
			size
		});
	}
	if (!response.body) {
		const body = await response.text();
		const size = new TextEncoder().encode(body).length;
		if (size > maxResponseBodySize) throw new ResponseBodyTooLargeError({
			maxSize: maxResponseBodySize,
			size
		});
		return body;
	}
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let body = "";
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > maxResponseBodySize) {
				await reader.cancel();
				throw new ResponseBodyTooLargeError({
					maxSize: maxResponseBodySize,
					size
				});
			}
			body += decoder.decode(value, { stream: true });
		}
		body += decoder.decode();
		return body;
	} finally {
		reader.releaseLock();
	}
}
/** @internal */
function parseUrl(url_) {
	try {
		const url = new URL(url_);
		const result = (() => {
			if (url.username) {
				const credentials = `${decodeURIComponent(url.username)}:${decodeURIComponent(url.password)}`;
				url.username = "";
				url.password = "";
				return {
					url: url.toString(),
					headers: { Authorization: `Basic ${btoa(credentials)}` }
				};
			}
		})();
		return {
			url: url.toString(),
			...result
		};
	} catch {
		return { url: url_ };
	}
}
//#endregion
//#region node_modules/viem/_esm/constants/strings.js
var presignMessagePrefix = "Ethereum Signed Message:\n";
//#endregion
//#region node_modules/viem/_esm/utils/signature/toPrefixedMessage.js
function toPrefixedMessage(message_) {
	const message = (() => {
		if (typeof message_ === "string") return stringToHex(message_);
		if (typeof message_.raw === "string") return message_.raw;
		return bytesToHex(message_.raw);
	})();
	return concat([stringToHex(`${presignMessagePrefix}${size$1(message)}`), message]);
}
//#endregion
//#region node_modules/viem/_esm/utils/signature/hashMessage.js
function hashMessage(message, to_) {
	return keccak256(toPrefixedMessage(message), to_);
}
//#endregion
//#region node_modules/viem/_esm/errors/typedData.js
var InvalidDomainError = class extends BaseError {
	constructor({ domain }) {
		super(`Invalid domain "${stringify(domain)}".`, { metaMessages: ["Must be a valid EIP-712 domain."] });
	}
};
var InvalidPrimaryTypeError = class extends BaseError {
	constructor({ primaryType, types }) {
		super(`Invalid primary type \`${primaryType}\` must be one of \`${JSON.stringify(Object.keys(types))}\`.`, {
			docsPath: "/api/glossary/Errors#typeddatainvalidprimarytypeerror",
			metaMessages: ["Check that the primary type is a key in `types`."]
		});
	}
};
var InvalidStructTypeError = class extends BaseError {
	constructor({ type }) {
		super(`Struct type "${type}" is invalid.`, {
			metaMessages: ["Struct type must not be a Solidity type."],
			name: "InvalidStructTypeError"
		});
	}
};
var InvalidTypedDataTypeError = class extends BaseError {
	constructor({ type }) {
		const canonicalType = type.replace(/^(u?int)/, "$&256");
		super(`Type "${type}" is not a valid EIP-712 type.`, {
			metaMessages: [`Use "${canonicalType}" instead.`],
			name: "InvalidTypedDataTypeError"
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/utils/typedData.js
function serializeTypedData(parameters) {
	const { domain: domain_, message: message_, primaryType, types } = parameters;
	const normalizeData = (struct, data_) => {
		const data = { ...data_ };
		for (const param of struct) {
			const { name, type } = param;
			if (type === "address") data[name] = data[name].toLowerCase();
		}
		return data;
	};
	return stringify({
		domain: (() => {
			if (!types.EIP712Domain) return {};
			if (!domain_) return {};
			return normalizeData(types.EIP712Domain, domain_);
		})(),
		message: (() => {
			if (primaryType === "EIP712Domain") return void 0;
			return normalizeData(types[primaryType], message_);
		})(),
		primaryType,
		types
	});
}
function validateTypedData(parameters) {
	const { domain, message, primaryType, types } = parameters;
	const validateData = (struct, data) => {
		for (const param of struct) {
			const { name, type } = param;
			const value = data[name];
			const baseType = type.replace(/(\[[0-9]*\])+$/, "");
			if (baseType === "int" || baseType === "uint") throw new InvalidTypedDataTypeError({ type });
			const integerMatch = type.match(integerRegex);
			if (integerMatch && (typeof value === "number" || typeof value === "bigint")) {
				const [_type, base, size_] = integerMatch;
				numberToHex(value, {
					signed: base === "int",
					size: Number.parseInt(size_, 10) / 8
				});
			}
			if (type === "address" && typeof value === "string" && !isAddress(value)) throw new InvalidAddressError({ address: value });
			const bytesMatch = type.match(bytesRegex);
			if (bytesMatch) {
				const [_type, size_] = bytesMatch;
				if (size_ && size$1(value) !== Number.parseInt(size_, 10)) throw new BytesSizeMismatchError({
					expectedSize: Number.parseInt(size_, 10),
					givenSize: size$1(value)
				});
			}
			const struct = types[type];
			if (struct) {
				validateReference(type);
				validateData(struct, value);
			}
		}
	};
	if (types.EIP712Domain && domain) {
		if (typeof domain !== "object") throw new InvalidDomainError({ domain });
		validateData(types.EIP712Domain, domain);
	}
	if (primaryType !== "EIP712Domain") {
		if (types[primaryType]) validateData(types[primaryType], message);
		else throw new InvalidPrimaryTypeError({
			primaryType,
			types
		});
	}
}
function getTypesForEIP712Domain({ domain }) {
	return [
		typeof domain?.name === "string" && {
			name: "name",
			type: "string"
		},
		domain?.version && {
			name: "version",
			type: "string"
		},
		(typeof domain?.chainId === "number" || typeof domain?.chainId === "bigint") && {
			name: "chainId",
			type: "uint256"
		},
		domain?.verifyingContract && {
			name: "verifyingContract",
			type: "address"
		},
		domain?.salt && {
			name: "salt",
			type: "bytes32"
		}
	].filter(Boolean);
}
/** @internal */
function validateReference(type) {
	if (type === "address" || type === "bool" || type === "string" || type.startsWith("bytes") || type.startsWith("uint") || type.startsWith("int")) throw new InvalidStructTypeError({ type });
}
//#endregion
//#region node_modules/viem/_esm/utils/signature/hashTypedData.js
function hashTypedData(parameters) {
	const { domain = {}, message, primaryType } = parameters;
	const types = {
		EIP712Domain: getTypesForEIP712Domain({ domain }),
		...parameters.types
	};
	validateTypedData({
		domain,
		message,
		primaryType,
		types
	});
	const parts = ["0x1901"];
	if (domain) parts.push(hashDomain({
		domain,
		types
	}));
	if (primaryType !== "EIP712Domain") parts.push(hashStruct({
		data: message,
		primaryType,
		types
	}));
	return keccak256(concat(parts));
}
function hashDomain({ domain, types }) {
	return hashStruct({
		data: domain,
		primaryType: "EIP712Domain",
		types
	});
}
function hashStruct({ data, primaryType, types }) {
	return keccak256(encodeData({
		data,
		primaryType,
		types
	}));
}
function encodeData({ data, primaryType, types }) {
	const encodedTypes = [{ type: "bytes32" }];
	const encodedValues = [hashType({
		primaryType,
		types
	})];
	for (const field of types[primaryType]) {
		const [type, value] = encodeField({
			types,
			name: field.name,
			type: field.type,
			value: data[field.name]
		});
		encodedTypes.push(type);
		encodedValues.push(value);
	}
	return encodeAbiParameters(encodedTypes, encodedValues);
}
function hashType({ primaryType, types }) {
	return keccak256(toHex(encodeType({
		primaryType,
		types
	})));
}
function encodeType({ primaryType, types }) {
	let result = "";
	const unsortedDeps = findTypeDependencies({
		primaryType,
		types
	});
	unsortedDeps.delete(primaryType);
	const deps = [primaryType, ...Array.from(unsortedDeps).sort()];
	for (const type of deps) result += `${type}(${types[type].map(({ name, type: t }) => `${t} ${name}`).join(",")})`;
	return result;
}
function findTypeDependencies({ primaryType: primaryType_, types }, results = /* @__PURE__ */ new Set()) {
	const primaryType = primaryType_.match(/^\w*/u)?.[0];
	if (results.has(primaryType) || types[primaryType] === void 0) return results;
	results.add(primaryType);
	for (const field of types[primaryType]) findTypeDependencies({
		primaryType: field.type,
		types
	}, results);
	return results;
}
function encodeField({ types, name, type, value }) {
	if (types[type] !== void 0) return [{ type: "bytes32" }, keccak256(encodeData({
		data: value,
		primaryType: type,
		types
	}))];
	if (type === "bytes") return [{ type: "bytes32" }, keccak256(value)];
	if (type === "string") return [{ type: "bytes32" }, keccak256(toHex(value))];
	if (type.lastIndexOf("]") === type.length - 1) {
		const parsedType = type.slice(0, type.lastIndexOf("["));
		const typeValuePairs = value.map((item) => encodeField({
			name,
			type: parsedType,
			types,
			value: item
		}));
		return [{ type: "bytes32" }, keccak256(encodeAbiParameters(typeValuePairs.map(([t]) => t), typeValuePairs.map(([, v]) => v)))];
	}
	return [{ type }, value];
}
//#endregion
//#region node_modules/viem/_esm/utils/unit/formatUnits.js
/**
*  Divides a number by a given exponent of base 10 (10exponent), and formats it into a string representation of the number..
*
* - Docs: https://viem.sh/docs/utilities/formatUnits
*
* @example
* import { formatUnits } from 'viem'
*
* formatUnits(420000000000n, 9)
* // '420'
*/
function formatUnits(value, decimals) {
	return format(value, decimals);
}
//#endregion
//#region node_modules/viem/_esm/utils/unit/parseEther.js
/**
* Converts a string representation of ether to numerical wei.
*
* - Docs: https://viem.sh/docs/utilities/parseEther
*
* @example
* import { parseEther } from 'viem'
*
* parseEther('420')
* // 420000000000000000000n
*/
function parseEther(ether, unit = "wei") {
	return fromEther(ether, unit);
}
//#endregion
//#region node_modules/viem/_esm/utils/unit/parseUnits.js
/**
* Multiplies a string representation of a number by a given exponent of base 10 (10exponent).
*
* - Docs: https://viem.sh/docs/utilities/parseUnits
*
* @example
* import { parseUnits } from 'viem'
*
* parseUnits('420', 9)
* // 420000000000n
*/
function parseUnits(value, decimals) {
	return from(value, decimals);
}
//#endregion
//#region node_modules/viem/_esm/utils/formatters/proof.js
function formatStorageProof(storageProof) {
	return storageProof.map((proof) => ({
		...proof,
		value: BigInt(proof.value)
	}));
}
function formatProof(proof) {
	return {
		...proof,
		balance: proof.balance ? BigInt(proof.balance) : void 0,
		nonce: proof.nonce ? hexToNumber(proof.nonce) : void 0,
		storageProof: proof.storageProof ? formatStorageProof(proof.storageProof) : void 0
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getProof.js
/**
* Returns the account and storage values of the specified account including the Merkle-proof.
*
* - Docs: https://viem.sh/docs/actions/public/getProof
* - JSON-RPC Methods:
*   - Calls [`eth_getProof`](https://eips.ethereum.org/EIPS/eip-1186)
*
* @param client - Client to use
* @param parameters - {@link GetProofParameters}
* @returns Proof data. {@link GetProofReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getProof } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const block = await getProof(client, {
*  address: '0x...',
*  storageKeys: ['0x...'],
* })
*/
async function getProof(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical, storageKeys }) {
	const block = formatBlockParameter({
		blockHash,
		blockNumber,
		blockTag,
		requireCanonical
	});
	return formatProof(await client.request({
		method: "eth_getProof",
		params: [
			address,
			storageKeys,
			block
		]
	}));
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getRawTransaction.js
/**
* Returns the raw, serialized [Transaction](https://viem.sh/docs/glossary/terms#transaction) given a hash.
*
* - Docs: https://viem.sh/docs/actions/public/getRawTransaction
* - JSON-RPC Methods: `eth_getRawTransactionByHash`
*
* @param client - Client to use
* @param parameters - {@link GetRawTransactionParameters}
* @returns The raw, serialized transaction. {@link GetRawTransactionReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getRawTransaction } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const rawTransaction = await getRawTransaction(client, {
*   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
* })
*/
async function getRawTransaction(client, { hash }) {
	const rawTransaction = await client.request({
		method: "eth_getRawTransactionByHash",
		params: [hash]
	}, { dedupe: true });
	if (!rawTransaction) throw new TransactionNotFoundError({ hash });
	return rawTransaction;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getStorageAt.js
/**
* Returns the value from a storage slot at a given address.
*
* - Docs: https://viem.sh/docs/contract/getStorageAt
* - JSON-RPC Methods: [`eth_getStorageAt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getstorageat)
*
* @param client - Client to use
* @param parameters - {@link GetStorageAtParameters}
* @returns The value of the storage slot. {@link GetStorageAtReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getStorageAt } from 'viem/contract'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const code = await getStorageAt(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*   slot: toHex(0),
* })
*/
async function getStorageAt(client, { address, blockHash, blockNumber, blockTag = "latest", requireCanonical, slot }) {
	const block = formatBlockParameter({
		blockHash,
		blockNumber,
		blockTag,
		requireCanonical
	});
	return await client.request({
		method: "eth_getStorageAt",
		params: [
			address,
			slot,
			block
		]
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getStorageValues.js
/**
* Returns values from multiple storage slots for multiple adddresses at a given block.
*
* - Docs: https://viem.sh/docs/actions/public/getStorageValues
* - JSON-RPC Methods: [`eth_getStorageValues`](https://github.com/ethereum/execution-apis/issues/752)
*
* @param client - Client to use
* @param parameters - {@link GetStorageValuesParameters}
* @returns The values of the requested storage slots. {@link GetStorageValuesReturnType}
*
* @example
* import { createPublicClient, http, toHex } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getStorageValues } from 'viem/actions'
*
* const client = createPublicClient({ chain: mainnet, transport: http() })
* const values = await getStorageValues(client, {
*   requests: {
*     '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2': [
*       toHex(0, { size: 32 }),
*       toHex(1, { size: 32 }),
*     ],
*   },
* })
*/
async function getStorageValues(client, { blockHash, blockNumber, blockTag = "latest", requireCanonical, requests }) {
	const block = formatBlockParameter({
		blockHash,
		blockNumber,
		blockTag,
		requireCanonical
	});
	return client.request({
		method: "eth_getStorageValues",
		params: [requests, block]
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getTransaction.js
/**
* Returns information about a [Transaction](https://viem.sh/docs/glossary/terms#transaction) given a hash or block identifier.
*
* - Docs: https://viem.sh/docs/actions/public/getTransaction
* - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_fetching-transactions
* - JSON-RPC Methods: [`eth_getTransactionByHash`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionByHash)
*
* @param client - Client to use
* @param parameters - {@link GetTransactionParameters}
* @returns The transaction information. {@link GetTransactionReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getTransaction } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const transaction = await getTransaction(client, {
*   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
* })
*/
async function getTransaction(client, { blockHash, blockNumber, blockTag: blockTag_, hash, index, sender, nonce }) {
	const blockTag = blockTag_ || "latest";
	const blockNumberHex = blockNumber !== void 0 ? numberToHex(blockNumber) : void 0;
	let transaction = null;
	if (hash) transaction = await client.request({
		method: "eth_getTransactionByHash",
		params: [hash]
	}, { dedupe: true });
	else if (blockHash) transaction = await client.request({
		method: "eth_getTransactionByBlockHashAndIndex",
		params: [blockHash, numberToHex(index)]
	}, { dedupe: true });
	else if ((blockNumberHex || blockTag) && typeof index === "number") transaction = await client.request({
		method: "eth_getTransactionByBlockNumberAndIndex",
		params: [blockNumberHex || blockTag, numberToHex(index)]
	}, { dedupe: Boolean(blockNumberHex) });
	else if (sender && typeof nonce === "number") transaction = await client.request({
		method: "eth_getTransactionBySenderAndNonce",
		params: [sender, numberToHex(nonce)]
	}, { dedupe: true });
	if (!transaction) throw new TransactionNotFoundError({
		blockHash,
		blockNumber,
		blockTag,
		hash,
		index
	});
	return (client.chain?.formatters?.transaction?.format || formatTransaction)(transaction, "getTransaction");
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getTransactionConfirmations.js
/**
* Returns the number of blocks passed (confirmations) since the transaction was processed on a block.
*
* - Docs: https://viem.sh/docs/actions/public/getTransactionConfirmations
* - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_fetching-transactions
* - JSON-RPC Methods: [`eth_getTransactionConfirmations`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionConfirmations)
*
* @param client - Client to use
* @param parameters - {@link GetTransactionConfirmationsParameters}
* @returns The number of blocks passed since the transaction was processed. If confirmations is 0, then the Transaction has not been confirmed & processed yet. {@link GetTransactionConfirmationsReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getTransactionConfirmations } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const confirmations = await getTransactionConfirmations(client, {
*   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
* })
*/
async function getTransactionConfirmations(client, { hash, transactionReceipt }) {
	const [blockNumber, transaction] = await Promise.all([getAction(client, getBlockNumber, "getBlockNumber")({}), hash ? getAction(client, getTransaction, "getTransaction")({ hash }) : void 0]);
	const transactionBlockNumber = transactionReceipt?.blockNumber || transaction?.blockNumber;
	if (!transactionBlockNumber) return 0n;
	return blockNumber - transactionBlockNumber + 1n;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/getTransactionReceipt.js
/**
* Returns the [Transaction Receipt](https://viem.sh/docs/glossary/terms#transaction-receipt) given a [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash.
*
* - Docs: https://viem.sh/docs/actions/public/getTransactionReceipt
* - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_fetching-transactions
* - JSON-RPC Methods: [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_gettransactionreceipt)
*
* @param client - Client to use
* @param parameters - {@link GetTransactionReceiptParameters}
* @returns The transaction receipt. {@link GetTransactionReceiptReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getTransactionReceipt } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const transactionReceipt = await getTransactionReceipt(client, {
*   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
* })
*/
async function getTransactionReceipt(client, { hash }) {
	const receipt = await client.request({
		method: "eth_getTransactionReceipt",
		params: [hash]
	}, { dedupe: true });
	if (!receipt) throw new TransactionReceiptNotFoundError({ hash });
	return (client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt)(receipt, "getTransactionReceipt");
}
//#endregion
//#region node_modules/viem/_esm/actions/public/multicall.js
/**
* Similar to [`readContract`](https://viem.sh/docs/contract/readContract), but batches up multiple functions on a contract in a single RPC call via the [`multicall3` contract](https://github.com/mds1/multicall).
*
* - Docs: https://viem.sh/docs/contract/multicall
*
* @param client - Client to use
* @param parameters - {@link MulticallParameters}
* @returns An array of results with accompanying status. {@link MulticallReturnType}
*
* @example
* import { createPublicClient, http, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { multicall } from 'viem/contract'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const abi = parseAbi([
*   'function balanceOf(address) view returns (uint256)',
*   'function totalSupply() view returns (uint256)',
* ])
* const results = await multicall(client, {
*   contracts: [
*     {
*       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*       abi,
*       functionName: 'balanceOf',
*       args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
*     },
*     {
*       address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*       abi,
*       functionName: 'totalSupply',
*     },
*   ],
* })
* // [{ result: 424122n, status: 'success' }, { result: 1000000n, status: 'success' }]
*/
async function multicall(client, parameters) {
	const { account, authorizationList, allowFailure = true, blockHash, blockNumber, blockOverrides, blockTag, requireCanonical, stateOverride } = parameters;
	const contracts = parameters.contracts;
	const batch = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
	const batchSize = parameters.batchSize ?? batch.batchSize ?? 1024;
	const deployless = parameters.deployless ?? batch.deployless ?? false;
	const multicallAddress = (() => {
		if (parameters.multicallAddress) return parameters.multicallAddress;
		if (deployless) return null;
		if (client.chain) return getChainContractAddress({
			blockNumber,
			chain: client.chain,
			contract: "multicall3"
		});
		throw new Error("client chain not configured. multicallAddress is required.");
	})();
	const chunkedCalls = [[]];
	let currentChunk = 0;
	let currentChunkSize = 0;
	for (let i = 0; i < contracts.length; i++) {
		const { abi, address, args, functionName } = contracts[i];
		try {
			const callData = encodeFunctionData({
				abi,
				args,
				functionName
			});
			currentChunkSize += (callData.length - 2) / 2;
			if (batchSize > 0 && currentChunkSize > batchSize && chunkedCalls[currentChunk].length > 0) {
				currentChunk++;
				currentChunkSize = (callData.length - 2) / 2;
				chunkedCalls[currentChunk] = [];
			}
			chunkedCalls[currentChunk] = [...chunkedCalls[currentChunk], {
				allowFailure: true,
				callData,
				target: address
			}];
		} catch (err) {
			const error = getContractError(err, {
				abi,
				address,
				args,
				docsPath: "/docs/contract/multicall",
				functionName,
				sender: account
			});
			if (!allowFailure) throw error;
			chunkedCalls[currentChunk] = [...chunkedCalls[currentChunk], {
				allowFailure: true,
				callData: "0x",
				target: address
			}];
		}
	}
	const batching = Boolean(client.batch?.multicall);
	const batches = batching ? chunkedCalls.flatMap((calls) => calls.map((call) => [call])) : chunkedCalls;
	const aggregate3Results = await Promise.allSettled(batches.map((calls) => {
		if (batching) return scheduleMulticall(client, {
			account,
			authorizationList,
			batchSize,
			blockHash,
			blockNumber,
			blockOverrides,
			blockTag,
			call: calls[0],
			multicallAddress,
			requireCanonical,
			stateOverride
		}).then((result) => [result]);
		return getAction(client, readContract, "readContract")({
			...multicallAddress === null ? { code: multicall3Bytecode } : { address: multicallAddress },
			abi: multicall3Abi,
			account,
			args: [calls],
			authorizationList,
			blockHash,
			blockNumber,
			blockOverrides,
			blockTag,
			functionName: "aggregate3",
			requireCanonical,
			stateOverride
		});
	}));
	const results = [];
	for (let i = 0; i < aggregate3Results.length; i++) {
		const result = aggregate3Results[i];
		if (result.status === "rejected") {
			if (!allowFailure) throw result.reason;
			for (let j = 0; j < batches[i].length; j++) results.push({
				status: "failure",
				error: result.reason,
				result: void 0
			});
			continue;
		}
		const aggregate3Result = result.value;
		for (let j = 0; j < aggregate3Result.length; j++) {
			const { returnData, success } = aggregate3Result[j];
			const { callData } = batches[i][j];
			const { abi, address, functionName, args } = contracts[results.length];
			try {
				if (callData === "0x") throw new AbiDecodingZeroDataError();
				if (!success) throw new RawContractError({ data: returnData });
				const result = decodeFunctionResult({
					abi,
					args,
					data: returnData,
					functionName
				});
				results.push(allowFailure ? {
					result,
					status: "success"
				} : result);
			} catch (err) {
				const error = getContractError(err, {
					abi,
					address,
					args,
					docsPath: "/docs/contract/multicall",
					functionName
				});
				if (!allowFailure) throw error;
				results.push({
					error,
					result: void 0,
					status: "failure"
				});
			}
		}
	}
	if (results.length !== contracts.length) throw new BaseError("multicall results mismatch");
	return results;
}
async function scheduleMulticall(client, parameters) {
	const { batchSize, call, multicallAddress, ...rest } = parameters;
	const { wait = 0 } = typeof client.batch?.multicall === "object" ? client.batch.multicall : {};
	const { schedule } = createBatchScheduler({
		id: stringify([
			"multicall",
			client.uid,
			batchSize,
			multicallAddress,
			rest
		]),
		wait,
		shouldSplitBatch(calls) {
			if (batchSize === 0) return false;
			return calls.reduce((size, { callData }) => size + (callData.length - 2) / 2, 0) > batchSize;
		},
		fn: (calls) => getAction(client, readContract, "readContract")({
			...multicallAddress === null ? { code: multicall3Bytecode } : { address: multicallAddress },
			...rest,
			abi: multicall3Abi,
			args: [calls],
			functionName: "aggregate3"
		})
	});
	const [result] = await schedule(call);
	return result;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/simulateBlocks.js
/**
* Simulates a set of calls on block(s) with optional block and state overrides.
*
* @example
* ```ts
* import { createClient, http, parseEther } from 'viem'
* import { simulate } from 'viem/actions'
* import { mainnet } from 'viem/chains'
*
* const client = createClient({
*   chain: mainnet,
*   transport: http(),
* })
*
* const result = await simulate(client, {
*   blocks: [{
*     blockOverrides: {
*       number: 69420n,
*     },
*     calls: [{
*       {
*         account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
*         data: '0xdeadbeef',
*         to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*       },
*       {
*         account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
*         to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*         value: parseEther('1'),
*       },
*     }],
*     stateOverrides: [{
*       address: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
*       balance: parseEther('10'),
*     }],
*   }]
* })
* ```
*
* @param client - Client to use.
* @param parameters - {@link SimulateBlocksParameters}
* @returns Simulated blocks. {@link SimulateBlocksReturnType}
*/
async function simulateBlocks(client, parameters) {
	const { blockNumber, blockTag = client.experimental_blockTag ?? "latest", blocks, returnFullTransactions, traceTransfers, validation } = parameters;
	try {
		const blockStateCalls = [];
		for (const block of blocks) {
			const blockOverrides = block.blockOverrides ? toRpc(block.blockOverrides) : void 0;
			const calls = block.calls.map((call_) => {
				const call = call_;
				const account = call.account ? parseAccount(call.account) : void 0;
				const data = call.abi ? encodeFunctionData(call) : call.data;
				const request = {
					...call,
					account,
					data: call.dataSuffix ? concat([data || "0x", call.dataSuffix]) : data,
					from: call.from ?? account?.address
				};
				assertRequest(request);
				return formatTransactionRequest(request);
			});
			const stateOverrides = block.stateOverrides ? serializeStateOverride(block.stateOverrides) : void 0;
			blockStateCalls.push({
				blockOverrides,
				calls,
				stateOverrides
			});
		}
		const block = (typeof blockNumber === "bigint" ? numberToHex(blockNumber) : void 0) || blockTag;
		return (await client.request({
			method: "eth_simulateV1",
			params: [{
				blockStateCalls,
				returnFullTransactions,
				traceTransfers,
				validation
			}, block]
		})).map((block, i) => ({
			...formatBlock(block),
			calls: block.calls.map((call, j) => {
				const { abi, args, functionName, to } = blocks[i].calls[j];
				const data = call.error?.data ?? call.returnData;
				const gasUsed = BigInt(call.gasUsed);
				const maxUsedGas = call.maxUsedGas === void 0 ? void 0 : BigInt(call.maxUsedGas);
				const logs = call.logs?.map((log) => formatLog(log));
				const status = call.status === "0x1" ? "success" : "failure";
				const result = abi && status === "success" && data !== "0x" ? decodeFunctionResult({
					abi,
					data,
					functionName
				}) : null;
				const error = (() => {
					if (status === "success") return void 0;
					let error;
					if (data === "0x") error = new AbiDecodingZeroDataError();
					else if (data) error = new RawContractError({ data });
					if (!error) return void 0;
					return getContractError(error, {
						abi: abi ?? [],
						address: to ?? "0x",
						args,
						functionName: functionName ?? "<unknown>"
					});
				})();
				return {
					data,
					gasUsed,
					logs,
					...maxUsedGas === void 0 ? {} : { maxUsedGas },
					status,
					...status === "success" ? { result } : { error }
				};
			})
		}));
	} catch (e) {
		const cause = e;
		const error = getNodeError(cause, {});
		if (error instanceof UnknownNodeError) throw cause;
		throw error;
	}
}
//#endregion
//#region node_modules/viem/_esm/constants/address.js
var ethAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
var zeroAddress = "0x0000000000000000000000000000000000000000";
//#endregion
//#region node_modules/viem/_esm/actions/public/simulateCalls.js
var getBalanceCode = "0x6080604052348015600e575f80fd5b5061016d8061001c5f395ff3fe608060405234801561000f575f80fd5b5060043610610029575f3560e01c8063f8b2cb4f1461002d575b5f80fd5b610047600480360381019061004291906100db565b61005d565b604051610054919061011e565b60405180910390f35b5f8173ffffffffffffffffffffffffffffffffffffffff16319050919050565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f6100aa82610081565b9050919050565b6100ba816100a0565b81146100c4575f80fd5b50565b5f813590506100d5816100b1565b92915050565b5f602082840312156100f0576100ef61007d565b5b5f6100fd848285016100c7565b91505092915050565b5f819050919050565b61011881610106565b82525050565b5f6020820190506101315f83018461010f565b9291505056fea26469706673582212203b9fe929fe995c7cf9887f0bdba8a36dd78e8b73f149b17d2d9ad7cd09d2dc6264736f6c634300081a0033";
var staticCallCode = "0x608060405234801561000f575f5ffd5b5060043610610029575f3560e01c8063fd00430c1461002d575b5f5ffd5b6100476004803603810190610042919061012b565b610049565b005b80825f375f5f825f865afa610060573d5f5f3e3d5ffd5b3d5f5f3e3d5ff35b5f5ffd5b5f5ffd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f61009982610070565b9050919050565b6100a98161008f565b81146100b3575f5ffd5b50565b5f813590506100c4816100a0565b92915050565b5f5ffd5b5f5ffd5b5f5ffd5b5f5f83601f8401126100eb576100ea6100ca565b5b8235905067ffffffffffffffff811115610108576101076100ce565b5b602083019150836001820283011115610124576101236100d2565b5b9250929050565b5f5f5f6040848603121561014257610141610068565b5b5f61014f868287016100b6565b935050602084013567ffffffffffffffff8111156101705761016f61006c565b5b61017c868287016100d6565b9250925050925092509256fea2646970667358221220635ed99185cacf3f2acba6921f23687c969cec2bbaf5f9ad599f507e6e105e6964736f6c63430008230033";
var assetProbeGas = 1000000n;
var staticCallAddressBase = 3735928559n;
var transferEventSelector = getSelector(from$1("event Transfer(address indexed from, address indexed to, uint256 value)"));
var balanceOfFunction = from$2("function balanceOf(address) returns (uint256)");
var decimalsFunction = from$2("function decimals() returns (uint256)");
var tokenUriFunction = from$2("function tokenURI(uint256) returns (string)");
var symbolFunction = from$2("function symbol() returns (string)");
var staticCallFunction = from$2("function query(address target, bytes data)");
/**
* Simulates execution of a batch of calls.
*
* @param client - Client to use
* @param parameters - {@link SimulateCallsParameters}
* @returns Results. {@link SimulateCallsReturnType}
*
* @example
* ```ts
* import { createPublicClient, http, parseEther } from 'viem'
* import { mainnet } from 'viem/chains'
* import { simulateCalls } from 'viem/actions'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
*
* const result = await simulateCalls(client, {
*   account: '0x5a0b54d5dc17e482fe8b0bdca5320161b95fb929',
*   calls: [{
*     {
*       data: '0xdeadbeef',
*       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*     },
*     {
*       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*       value: parseEther('1'),
*     },
*   ]
* })
* ```
*/
async function simulateCalls(client, parameters) {
	const { blockNumber, blockTag, calls, stateOverrides, traceAssetChanges, traceTransfers, validation } = parameters;
	const account = parameters.account ? parseAccount(parameters.account) : void 0;
	if (traceAssetChanges && !account) throw new BaseError("`account` is required when `traceAssetChanges` is true");
	const getBalanceData = account ? encode(from$3("constructor(bytes, bytes)"), {
		bytecode: deploylessCallViaBytecodeBytecode,
		args: [getBalanceCode, encodeData$1(from$2("function getBalance(address)"), [account.address])]
	}) : void 0;
	const blockTag_ = blockTag ?? client.experimental_blockTag ?? "latest";
	let baseBlockNumber = blockNumber;
	if (traceAssetChanges && typeof baseBlockNumber !== "bigint" && blockTag_ !== "earliest" && blockTag_ !== "pending") {
		if (blockTag_ === "latest") baseBlockNumber = await getBlockNumber(client, { cacheTime: 0 });
		else {
			const block = await getBlock(client, { blockTag: blockTag_ });
			if (typeof block.number !== "bigint") throw new BaseError(`Block tag \`${blockTag_}\` did not resolve to a number.`);
			baseBlockNumber = block.number;
		}
	}
	const block_ = typeof baseBlockNumber === "bigint" ? { blockNumber: baseBlockNumber } : { blockTag: blockTag_ };
	const discovery = traceAssetChanges ? await simulateBlocks(client, {
		...block_,
		blocks: [{
			calls: calls.map((call) => ({
				...call,
				from: account.address
			})),
			stateOverrides
		}],
		traceTransfers,
		validation
	}) : void 0;
	const assetAddresses = discovery ? [.../* @__PURE__ */ new Set([...tokensFromLogs(discovery[0].calls.flatMap((call) => call.logs ?? []), account.address), ...parameters.calls.map((call) => call.to?.toLowerCase())])].filter((address) => Boolean(address) && address !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" && address !== "0x0000000000000000000000000000000000000000") : [];
	const staticCallAddress = getStaticCallAddress([
		...account ? [account.address] : [],
		...assetAddresses,
		...stateOverrides?.map(({ address }) => address) ?? []
	]);
	const staticCallStateOverrides = [{
		address: staticCallAddress,
		code: staticCallCode
	}];
	const [balanceCallsPre, blocks] = await Promise.all([traceAssetChanges ? Promise.all([readBalance(client, {
		account: account.address,
		...block_,
		data: getBalanceData,
		stateOverride: stateOverrides
	}), ...assetAddresses.map((address) => readBalance(client, {
		account: account.address,
		address,
		...block_,
		data: encodeData$1(balanceOfFunction, [account.address]),
		staticCallAddress,
		stateOverride: stateOverrides
	}))]) : [], simulateBlocks(client, {
		...block_,
		blocks: [{
			calls: [...calls, { to: zeroAddress }].map((call) => ({
				...call,
				from: account?.address
			})),
			stateOverrides
		}, ...traceAssetChanges ? [
			{ calls: [{ data: getBalanceData }] },
			{
				calls: assetAddresses.map((address) => ({
					to: staticCallAddress,
					gas: assetProbeGas,
					data: encodeStaticCall(address, encodeData$1(balanceOfFunction, [account.address]))
				})),
				stateOverrides: staticCallStateOverrides
			},
			{
				calls: assetAddresses.map((address) => ({
					to: staticCallAddress,
					gas: assetProbeGas,
					data: encodeStaticCall(address, encodeData$1(decimalsFunction))
				})),
				stateOverrides: staticCallStateOverrides
			},
			{
				calls: assetAddresses.map((address) => ({
					to: staticCallAddress,
					gas: assetProbeGas,
					data: encodeStaticCall(address, encodeData$1(tokenUriFunction, [0n]))
				})),
				stateOverrides: staticCallStateOverrides
			},
			{
				calls: assetAddresses.map((address) => ({
					to: staticCallAddress,
					gas: assetProbeGas,
					data: encodeStaticCall(address, encodeData$1(symbolFunction))
				})),
				stateOverrides: staticCallStateOverrides
			}
		] : []],
		traceTransfers,
		validation
	})]);
	const block_results = blocks[0];
	const [block_ethPost, block_assetsPost, block_decimals, block_tokenURI, block_symbols] = traceAssetChanges ? blocks.slice(1) : [];
	const { calls: block_calls, ...block } = block_results;
	const results = block_calls.slice(0, -1);
	const balancesPre = balanceCallsPre.map((call) => isBalance(call) ? hexToBigInt(call.data) : null);
	const ethPost = block_ethPost?.calls ?? [];
	const assetsPost = block_assetsPost?.calls ?? [];
	const balancesPost = [...ethPost, ...assetsPost].map((call) => isBalance(call) ? hexToBigInt(call.data) : null);
	const decimals = (block_decimals?.calls ?? []).map((call) => decodeAssetResult(call, decimalsFunction));
	const symbols = (block_symbols?.calls ?? []).map((call) => decodeAssetResult(call, symbolFunction));
	const tokenURI = (block_tokenURI?.calls ?? []).map((call) => decodeAssetResult(call, tokenUriFunction));
	const changes = [];
	for (const [i, balancePost] of balancesPost.entries()) {
		const balancePre_ = balancesPre[i];
		const preCall = balanceCallsPre[i];
		const balancePre = typeof balancePre_ === "bigint" ? balancePre_ : i > 0 && preCall?.status === "success" && preCall.data === "0x" ? 0n : null;
		if (typeof balancePost !== "bigint") continue;
		if (typeof balancePre !== "bigint") continue;
		const decimals_ = decimals[i - 1];
		const symbol_ = symbols[i - 1];
		const tokenURI_ = tokenURI[i - 1];
		const token = (() => {
			if (i === 0) return {
				address: ethAddress,
				decimals: 18,
				symbol: "ETH"
			};
			return {
				address: assetAddresses[i - 1],
				decimals: tokenURI_ || decimals_ ? Number(decimals_ ?? 1) : void 0,
				symbol: symbol_ ?? void 0
			};
		})();
		changes.push({
			token,
			value: {
				pre: balancePre,
				post: balancePost,
				diff: balancePost - balancePre
			}
		});
	}
	return {
		assetChanges: changes,
		block,
		results
	};
}
function encodeStaticCall(address, data) {
	return encodeData$1(staticCallFunction, [address, data]);
}
function tokensFromLogs(logs, account) {
	const account_ = pad(account.toLowerCase(), { size: 32 });
	return logs.filter((log) => {
		if (log.topics[0]?.toLowerCase() !== transferEventSelector) return false;
		if (log.address.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") return false;
		return log.topics[1]?.toLowerCase() === account_ || log.topics[2]?.toLowerCase() === account_;
	}).map((log) => log.address.toLowerCase());
}
function isBalance(call) {
	return call.status === "success" && /^0x[\da-f]{64}$/i.test(call.data);
}
function decodeAssetResult(call, abiFunction) {
	if (call.status === "failure" || call.data === "0x") return null;
	try {
		return decodeResult(abiFunction, call.data);
	} catch {
		return null;
	}
}
async function readBalance(client, parameters) {
	const { account, address, blockNumber, blockTag, data, staticCallAddress, stateOverride } = parameters;
	try {
		return {
			data: (await call({
				...client,
				ccipRead: false
			}, {
				account: address ? "0x0000000000000000000000000000000000000000" : account,
				data: address ? encodeStaticCall(address, data) : data,
				stateOverride: address && staticCallAddress ? [...stateOverride ?? [], {
					address: staticCallAddress,
					code: staticCallCode
				}] : stateOverride,
				...address ? {
					gas: assetProbeGas,
					to: staticCallAddress
				} : {},
				...typeof blockNumber === "bigint" ? { blockNumber } : { blockTag }
			})).data ?? "0x",
			status: "success"
		};
	} catch (error) {
		if (!(error instanceof CallExecutionError) || !(error.cause instanceof ExecutionRevertedError)) throw error;
		return {
			data: "0x",
			status: "failure"
		};
	}
}
function getStaticCallAddress(addresses) {
	const occupied = new Set(addresses.map((address) => address.toLowerCase()));
	let value = staticCallAddressBase;
	while (occupied.has(`0x${value.toString(16).padStart(40, "0")}`)) value++;
	return `0x${value.toString(16).padStart(40, "0")}`;
}
//#endregion
//#region node_modules/viem/_esm/utils/signature/serializeSignature.js
/**
* @description Converts a signature into hex format.
*
* @param signature The signature to convert.
* @returns The signature in hex format.
*
* @example
* serializeSignature({
*   r: '0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf',
*   s: '0x4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db8',
*   yParity: 1
* })
* // "0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c"
*/
function serializeSignature({ r, s, to = "hex", v, yParity }) {
	const yParity_ = (() => {
		if (yParity === 0 || yParity === 1) return yParity;
		if (v && (v === 27n || v === 28n || v >= 35n)) return v % 2n === 0n ? 1 : 0;
		throw new Error("Invalid `v` or `yParity` value");
	})();
	const signature = `0x${new secp256k1.Signature(hexToBigInt(r), hexToBigInt(s)).toCompactHex()}${yParity_ === 0 ? "1b" : "1c"}`;
	if (to === "hex") return signature;
	return hexToBytes(signature);
}
//#endregion
//#region node_modules/viem/_esm/actions/public/verifyHash.js
/**
* Verifies a message hash onchain using ERC-6492.
*
* @param client - Client to use.
* @param parameters - {@link VerifyHashParameters}
* @returns Whether or not the signature is valid. {@link VerifyHashReturnType}
*/
async function verifyHash(client, parameters) {
	const { address, chain = client.chain, hash, erc6492VerifierAddress: verifierAddress = parameters.universalSignatureVerifierAddress ?? chain?.contracts?.erc6492Verifier?.address, multicallAddress = parameters.multicallAddress ?? chain?.contracts?.multicall3?.address, mode = "auto" } = parameters;
	if (chain?.verifyHash) return await chain.verifyHash(client, parameters);
	const signature = (() => {
		const signature = parameters.signature;
		if (isHex(signature)) return signature;
		if (typeof signature === "object" && "r" in signature && "s" in signature) return serializeSignature(signature);
		return bytesToHex(signature);
	})();
	try {
		if (mode === "eoa") try {
			if (isAddressEqual(getAddress(address), await recoverAddress({
				hash,
				signature
			}))) return true;
		} catch {}
		if (validate(signature)) return await verifyErc8010(client, {
			...parameters,
			multicallAddress,
			signature
		});
		return await verifyErc6492(client, {
			...parameters,
			verifierAddress,
			signature
		});
	} catch (error) {
		if (mode !== "eoa") try {
			if (isAddressEqual(getAddress(address), await recoverAddress({
				hash,
				signature
			}))) return true;
		} catch {}
		if (error instanceof VerificationError) return false;
		throw error;
	}
}
/** @internal */
async function verifyErc8010(client, parameters) {
	const { address, blockHash, blockNumber, blockTag, hash, multicallAddress, requireCanonical } = parameters;
	const { authorization: authorization_ox, data: initData, signature, to } = unwrap(parameters.signature);
	if (await getCode(client, {
		address,
		blockHash,
		blockNumber,
		blockTag,
		requireCanonical
	}) === concatHex(["0xef0100", authorization_ox.address])) return await verifyErc1271(client, {
		...parameters,
		signature
	});
	const authorization = {
		address: authorization_ox.address,
		chainId: Number(authorization_ox.chainId),
		nonce: Number(authorization_ox.nonce),
		r: numberToHex(authorization_ox.r, { size: 32 }),
		s: numberToHex(authorization_ox.s, { size: 32 }),
		yParity: authorization_ox.yParity
	};
	if (!await verifyAuthorization({
		address,
		authorization
	})) throw new VerificationError();
	const results = await getAction(client, readContract, "readContract")({
		...multicallAddress ? { address: multicallAddress } : { code: multicall3Bytecode },
		authorizationList: [authorization],
		abi: multicall3Abi,
		blockHash,
		blockNumber,
		blockTag: "pending",
		functionName: "aggregate3",
		requireCanonical,
		args: [[...initData ? [{
			allowFailure: true,
			target: to ?? address,
			callData: initData
		}] : [], {
			allowFailure: true,
			target: address,
			callData: encodeFunctionData({
				abi: erc1271Abi,
				functionName: "isValidSignature",
				args: [hash, signature]
			})
		}]]
	});
	if ((results[results.length - 1]?.returnData)?.startsWith("0x1626ba7e")) return true;
	throw new VerificationError();
}
/** @internal */
async function verifyErc6492(client, parameters) {
	const { address, factory, factoryData, hash, signature, verifierAddress, ...rest } = parameters;
	const wrappedSignature = await (async () => {
		if (!factory && !factoryData) return signature;
		if (validate$1(signature)) return signature;
		return wrap({
			data: factoryData,
			signature,
			to: factory
		});
	})();
	const args = verifierAddress ? {
		to: verifierAddress,
		data: encodeFunctionData({
			abi: erc6492SignatureValidatorAbi,
			functionName: "isValidSig",
			args: [
				address,
				hash,
				wrappedSignature
			]
		}),
		...rest
	} : {
		data: encodeDeployData({
			abi: erc6492SignatureValidatorAbi,
			args: [
				address,
				hash,
				wrappedSignature
			],
			bytecode: erc6492SignatureValidatorByteCode
		}),
		...rest
	};
	const { data } = await getAction(client, call, "call")(args).catch((error) => {
		if (error instanceof CallExecutionError) throw new VerificationError();
		throw error;
	});
	if (hexToBool(data ?? "0x0")) return true;
	throw new VerificationError();
}
/** @internal */
async function verifyErc1271(client, parameters) {
	const { address, blockHash, blockNumber, blockTag, hash, requireCanonical, signature } = parameters;
	if ((await getAction(client, readContract, "readContract")({
		address,
		abi: erc1271Abi,
		args: [hash, signature],
		blockHash,
		blockNumber,
		blockTag,
		functionName: "isValidSignature",
		requireCanonical
	}).catch((error) => {
		if (error instanceof ContractFunctionExecutionError) throw new VerificationError();
		throw error;
	})).startsWith("0x1626ba7e")) return true;
	throw new VerificationError();
}
var VerificationError = class extends Error {};
//#endregion
//#region node_modules/viem/_esm/actions/public/verifyMessage.js
/**
* Verify that a message was signed by the provided address.
*
* Compatible with Smart Contract Accounts & Externally Owned Accounts via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
*
* - Docs {@link https://viem.sh/docs/actions/public/verifyMessage}
*
* @param client - Client to use.
* @param parameters - {@link VerifyMessageParameters}
* @returns Whether or not the signature is valid. {@link VerifyMessageReturnType}
*/
async function verifyMessage(client, { address, message, factory, factoryData, signature, ...callRequest }) {
	const hash = hashMessage(message);
	return getAction(client, verifyHash, "verifyHash")({
		address,
		factory,
		factoryData,
		hash,
		signature,
		...callRequest
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/verifyTypedData.js
/**
* Verify that typed data was signed by the provided address.
*
* - Docs {@link https://viem.sh/docs/actions/public/verifyTypedData}
*
* @param client - Client to use.
* @param parameters - {@link VerifyTypedDataParameters}
* @returns Whether or not the signature is valid. {@link VerifyTypedDataReturnType}
*/
async function verifyTypedData(client, parameters) {
	const { address, factory, factoryData, signature, message, primaryType, types, domain, ...callRequest } = parameters;
	const hash = hashTypedData({
		message,
		primaryType,
		types,
		domain
	});
	return getAction(client, verifyHash, "verifyHash")({
		address,
		factory,
		factoryData,
		hash,
		signature,
		...callRequest
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/watchBlockNumber.js
/**
* Watches and returns incoming block numbers.
*
* - Docs: https://viem.sh/docs/actions/public/watchBlockNumber
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_watching-blocks
* - JSON-RPC Methods:
*   - When `poll: true`, calls [`eth_blockNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_blocknumber) on a polling interval.
*   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
*
* @param client - Client to use
* @param parameters - {@link WatchBlockNumberParameters}
* @returns A function that can be invoked to stop watching for new block numbers. {@link WatchBlockNumberReturnType}
*
* @example
* import { createPublicClient, watchBlockNumber, http } from 'viem'
* import { mainnet } from 'viem/chains'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const unwatch = watchBlockNumber(client, {
*   onBlockNumber: (blockNumber) => console.log(blockNumber),
* })
*/
function watchBlockNumber(client, { emitOnBegin = false, emitMissed = false, onBlockNumber, onError, poll: poll_, pollingInterval = client.pollingInterval }) {
	const enablePolling = (() => {
		if (typeof poll_ !== "undefined") return poll_;
		if (client.transport.type === "webSocket" || client.transport.type === "ipc") return false;
		if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc")) return false;
		return true;
	})();
	let prevBlockNumber;
	const pollBlockNumber = () => {
		return observe(stringify([
			"watchBlockNumber",
			client.uid,
			emitOnBegin,
			emitMissed,
			pollingInterval
		]), {
			onBlockNumber,
			onError
		}, (emit) => poll(async () => {
			try {
				const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({ cacheTime: 0 });
				if (prevBlockNumber !== void 0) {
					if (blockNumber === prevBlockNumber) return;
					if (blockNumber - prevBlockNumber > 1 && emitMissed) for (let i = prevBlockNumber + 1n; i < blockNumber; i++) {
						emit.onBlockNumber(i, prevBlockNumber);
						prevBlockNumber = i;
					}
				}
				if (prevBlockNumber === void 0 || blockNumber > prevBlockNumber) {
					emit.onBlockNumber(blockNumber, prevBlockNumber);
					prevBlockNumber = blockNumber;
				}
			} catch (err) {
				emit.onError?.(err);
			}
		}, {
			emitOnBegin,
			interval: pollingInterval
		}));
	};
	const subscribeBlockNumber = () => {
		return observe(stringify([
			"watchBlockNumber",
			client.uid,
			emitOnBegin,
			emitMissed
		]), {
			onBlockNumber,
			onError
		}, (emit) => {
			let active = true;
			let unsubscribe = () => active = false;
			(async () => {
				try {
					const { unsubscribe: unsubscribe_ } = await (() => {
						if (client.transport.type === "fallback") {
							const transport = client.transport.transports.find((transport) => transport.config.type === "webSocket" || transport.config.type === "ipc");
							if (!transport) return client.transport;
							return transport.value;
						}
						return client.transport;
					})().subscribe({
						params: ["newHeads"],
						onData(data) {
							if (!active) return;
							const blockNumber = hexToBigInt(data.result?.number);
							emit.onBlockNumber(blockNumber, prevBlockNumber);
							prevBlockNumber = blockNumber;
						},
						onError(error) {
							emit.onError?.(error);
						}
					});
					unsubscribe = unsubscribe_;
					if (!active) unsubscribe();
				} catch (err) {
					onError?.(err);
				}
			})();
			return () => unsubscribe();
		});
	};
	return enablePolling ? pollBlockNumber() : subscribeBlockNumber();
}
//#endregion
//#region node_modules/viem/_esm/actions/public/waitForTransactionReceipt.js
/**
* Waits for the [Transaction](https://viem.sh/docs/glossary/terms#transaction) to be included on a [Block](https://viem.sh/docs/glossary/terms#block) (one confirmation), and then returns the [Transaction Receipt](https://viem.sh/docs/glossary/terms#transaction-receipt).
*
* - Docs: https://viem.sh/docs/actions/public/waitForTransactionReceipt
* - Example: https://stackblitz.com/github/wevm/viem/tree/main/examples/transactions_sending-transactions
* - JSON-RPC Methods:
*   - Polls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt) on each block until it has been processed.
*   - If a Transaction has been replaced:
*     - Calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getblockbynumber) and extracts the transactions
*     - Checks if one of the Transactions is a replacement
*     - If so, calls [`eth_getTransactionReceipt`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getTransactionReceipt).
*
* The `waitForTransactionReceipt` action additionally supports Replacement detection (e.g. sped up Transactions).
*
* Transactions can be replaced when a user modifies their transaction in their wallet (to speed up or cancel). Transactions are replaced when they are sent from the same nonce.
*
* There are 3 types of Transaction Replacement reasons:
*
* - `repriced`: The gas price has been modified (e.g. different `maxFeePerGas`)
* - `cancelled`: The Transaction has been cancelled (e.g. `value === 0n`)
* - `replaced`: The Transaction has been replaced (e.g. different `value` or `data`)
*
* @param client - Client to use
* @param parameters - {@link WaitForTransactionReceiptParameters}
* @returns The transaction receipt. {@link WaitForTransactionReceiptReturnType}
*
* @example
* import { createPublicClient, waitForTransactionReceipt, http } from 'viem'
* import { mainnet } from 'viem/chains'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const transactionReceipt = await waitForTransactionReceipt(client, {
*   hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d',
* })
*/
async function waitForTransactionReceipt(client, parameters) {
	const { checkReplacement = client.chain?.supportsTransactionReplacementDetection ?? true, confirmations = 1, hash, onReplaced, retryCount = 6, retryDelay = ({ count }) => ~~(1 << count) * 200, timeout = 18e4 } = parameters;
	const pollingInterval = (() => {
		if (parameters.pollingInterval) return parameters.pollingInterval;
		if (client.chain?.experimental_preconfirmationTime) return client.chain.experimental_preconfirmationTime;
		return client.pollingInterval;
	})();
	const observerId = stringify([
		"waitForTransactionReceipt",
		client.uid,
		hash,
		{
			checkReplacement,
			confirmations,
			pollingInterval,
			retryCount,
			timeout
		}
	]);
	let transaction;
	let replacedTransaction;
	let receipt;
	let retrying = false;
	let _unobserve;
	let _unwatch;
	const { promise, resolve, reject } = withResolvers();
	const timer = timeout ? setTimeout(() => {
		_unwatch?.();
		_unobserve?.();
		reject(new WaitForTransactionReceiptTimeoutError({ hash }));
	}, timeout) : void 0;
	_unobserve = observe(observerId, {
		onReplaced,
		resolve,
		reject
	}, async (emit) => {
		receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash }).catch(() => void 0);
		if (receipt && confirmations <= 1) {
			clearTimeout(timer);
			emit.resolve(receipt);
			_unobserve?.();
			return;
		}
		_unwatch = getAction(client, watchBlockNumber, "watchBlockNumber")({
			emitMissed: true,
			emitOnBegin: true,
			poll: true,
			pollingInterval,
			async onBlockNumber(blockNumber_) {
				const done = (fn) => {
					clearTimeout(timer);
					_unwatch?.();
					fn();
					_unobserve?.();
				};
				let blockNumber = blockNumber_;
				if (retrying) return;
				try {
					if (receipt) {
						if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations)) return;
						done(() => emit.resolve(receipt));
						return;
					}
					if (checkReplacement && !transaction) {
						retrying = true;
						await withRetry(async () => {
							transaction = await getAction(client, getTransaction, "getTransaction")({ hash });
							if (transaction.blockNumber) blockNumber = transaction.blockNumber;
						}, {
							delay: retryDelay,
							retryCount
						});
						retrying = false;
					}
					receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash });
					if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations)) return;
					done(() => emit.resolve(receipt));
				} catch (err) {
					if (err instanceof TransactionNotFoundError || err instanceof TransactionReceiptNotFoundError) {
						if (!transaction) {
							retrying = false;
							return;
						}
						try {
							replacedTransaction = transaction;
							retrying = true;
							const block = await withRetry(() => getAction(client, getBlock, "getBlock")({
								blockNumber,
								includeTransactions: true
							}), {
								delay: retryDelay,
								retryCount,
								shouldRetry: ({ error }) => error instanceof BlockNotFoundError
							});
							retrying = false;
							const replacementTransaction = block.transactions.find(({ from, nonce }) => from === replacedTransaction.from && nonce === replacedTransaction.nonce);
							if (!replacementTransaction) return;
							receipt = await getAction(client, getTransactionReceipt, "getTransactionReceipt")({ hash: replacementTransaction.hash });
							if (confirmations > 1 && (!receipt.blockNumber || blockNumber - receipt.blockNumber + 1n < confirmations)) return;
							let reason = "replaced";
							if (replacementTransaction.to === replacedTransaction.to && replacementTransaction.value === replacedTransaction.value && replacementTransaction.input === replacedTransaction.input) reason = "repriced";
							else if (replacementTransaction.from === replacementTransaction.to && replacementTransaction.value === 0n) reason = "cancelled";
							done(() => {
								emit.onReplaced?.({
									reason,
									replacedTransaction,
									transaction: replacementTransaction,
									transactionReceipt: receipt
								});
								emit.resolve(receipt);
							});
						} catch (err_) {
							done(() => emit.reject(err_));
						}
					} else done(() => emit.reject(err));
				}
			}
		});
	});
	return promise;
}
//#endregion
//#region node_modules/viem/_esm/actions/public/watchBlockHeaders.js
var blockFields = [
	"size",
	"totalDifficulty",
	"transactions",
	"uncles",
	"withdrawals"
];
/**
* Watches and returns incoming block headers.
*
* - Docs: https://viem.sh/docs/actions/public/watchBlockHeaders
* - JSON-RPC Methods: Uses a WebSocket or IPC subscription via [`eth_subscribe`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_subscribe) and the `"newHeads"` event.
*
* @param client - Client to use
* @param parameters - {@link WatchBlockHeadersParameters}
* @returns A function that can be invoked to stop watching for new block headers. {@link WatchBlockHeadersReturnType}
*
* @example
* import { createPublicClient, webSocket } from 'viem'
* import { watchBlockHeaders } from 'viem/actions'
* import { mainnet } from 'viem/chains'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: webSocket(),
* })
* const unwatch = watchBlockHeaders(client, {
*   onBlockHeader: (blockHeader) => console.log(blockHeader),
* })
*/
function watchBlockHeaders(client, { onBlockHeader, onError }) {
	let prevBlockHeader;
	return observe(stringify(["watchBlockHeaders", client.uid]), {
		onBlockHeader,
		onError
	}, (emit) => {
		let active = true;
		let subscribed = false;
		let unsubscribe = () => active = false;
		(async () => {
			try {
				const { unsubscribe: unsubscribe_ } = await (() => {
					if (client.transport.type === "fallback") {
						const transport = client.transport.transports.find((transport) => transport.config.type === "webSocket" || transport.config.type === "ipc");
						if (!transport) return client.transport;
						return transport.value;
					}
					return client.transport;
				})().subscribe({
					params: ["newHeads"],
					onData(data) {
						if (!active) return;
						const blockHeader = (client.chain?.formatters?.block?.format || formatBlock)(data.result, "watchBlockHeaders");
						for (const field of blockFields) delete blockHeader[field];
						emit.onBlockHeader(blockHeader, prevBlockHeader);
						prevBlockHeader = blockHeader;
					},
					onError(error) {
						if (subscribed) emit.onError?.(error);
					}
				});
				subscribed = true;
				unsubscribe = unsubscribe_;
				if (!active) unsubscribe();
			} catch (err) {
				emit.onError?.(err);
			}
		})();
		return () => unsubscribe();
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/public/watchBlocks.js
/**
* Watches and returns information for incoming blocks.
*
* - Docs: https://viem.sh/docs/actions/public/watchBlocks
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/blocks_watching-blocks
* - JSON-RPC Methods:
*   - When `poll: true`, calls [`eth_getBlockByNumber`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getBlockByNumber) on a polling interval.
*   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newHeads"` event.
*
* @param client - Client to use
* @param parameters - {@link WatchBlocksParameters}
* @returns A function that can be invoked to stop watching for new block numbers. {@link WatchBlocksReturnType}
*
* @example
* import { createPublicClient, watchBlocks, http } from 'viem'
* import { mainnet } from 'viem/chains'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const unwatch = watchBlocks(client, {
*   onBlock: (block) => console.log(block),
* })
*/
function watchBlocks(client, { blockTag = client.experimental_blockTag ?? "latest", emitMissed = false, emitOnBegin = false, onBlock, onError, includeTransactions: includeTransactions_, poll: poll_, pollingInterval = client.pollingInterval }) {
	const enablePolling = (() => {
		if (typeof poll_ !== "undefined") return poll_;
		if (client.transport.type === "webSocket" || client.transport.type === "ipc") return false;
		if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc")) return false;
		return true;
	})();
	const includeTransactions = includeTransactions_ ?? false;
	let prevBlock;
	const pollBlocks = () => {
		return observe(stringify([
			"watchBlocks",
			client.uid,
			blockTag,
			emitMissed,
			emitOnBegin,
			includeTransactions,
			pollingInterval
		]), {
			onBlock,
			onError
		}, (emit) => poll(async () => {
			try {
				const block = await getAction(client, getBlock, "getBlock")({
					blockTag,
					includeTransactions
				});
				if (block.number !== null && prevBlock?.number != null) {
					if (block.number === prevBlock.number) return;
					if (block.number - prevBlock.number > 1 && emitMissed) for (let i = prevBlock?.number + 1n; i < block.number; i++) {
						const block = await getAction(client, getBlock, "getBlock")({
							blockNumber: i,
							includeTransactions
						});
						emit.onBlock(block, prevBlock);
						prevBlock = block;
					}
				}
				if (prevBlock?.number == null || blockTag === "pending" && block?.number == null || block.number !== null && block.number > prevBlock.number) {
					emit.onBlock(block, prevBlock);
					prevBlock = block;
				}
			} catch (err) {
				emit.onError?.(err);
			}
		}, {
			emitOnBegin,
			interval: pollingInterval
		}));
	};
	const subscribeBlocks = () => {
		let active = true;
		let emitFetched = true;
		let unsubscribe = () => active = false;
		(async () => {
			try {
				if (emitOnBegin) getAction(client, getBlock, "getBlock")({
					blockTag,
					includeTransactions
				}).then((block) => {
					if (!active) return;
					if (!emitFetched) return;
					onBlock(block, void 0);
					emitFetched = false;
				}).catch(onError);
				const { unsubscribe: unsubscribe_ } = await (() => {
					if (client.transport.type === "fallback") {
						const transport = client.transport.transports.find((transport) => transport.config.type === "webSocket" || transport.config.type === "ipc");
						if (!transport) return client.transport;
						return transport.value;
					}
					return client.transport;
				})().subscribe({
					params: ["newHeads"],
					async onData(data) {
						if (!active) return;
						const block = await getAction(client, getBlock, "getBlock")({
							blockNumber: data.result?.number,
							includeTransactions
						}).catch(() => {});
						if (!active) return;
						onBlock(block, prevBlock);
						emitFetched = false;
						prevBlock = block;
					},
					onError(error) {
						onError?.(error);
					}
				});
				unsubscribe = unsubscribe_;
				if (!active) unsubscribe();
			} catch (err) {
				onError?.(err);
			}
		})();
		return () => unsubscribe();
	};
	return enablePolling ? pollBlocks() : subscribeBlocks();
}
//#endregion
//#region node_modules/viem/_esm/actions/public/watchEvent.js
/**
* Watches and returns emitted [Event Logs](https://viem.sh/docs/glossary/terms#event-log).
*
* - Docs: https://viem.sh/docs/actions/public/watchEvent
* - JSON-RPC Methods:
*   - **RPC Provider supports `eth_newFilter`:**
*     - Calls [`eth_newFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter) to create a filter (called on initialize).
*     - On a polling interval, it will call [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getfilterchanges).
*   - **RPC Provider does not support `eth_newFilter`:**
*     - Calls [`eth_getLogs`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getlogs) for each block between the polling interval.
*
* This Action will batch up all the Event Logs found within the [`pollingInterval`](https://viem.sh/docs/actions/public/watchEvent#pollinginterval-optional), and invoke them via [`onLogs`](https://viem.sh/docs/actions/public/watchEvent#onLogs).
*
* `watchEvent` will attempt to create an [Event Filter](https://viem.sh/docs/actions/public/createEventFilter) and listen to changes to the Filter per polling interval, however, if the RPC Provider does not support Filters (e.g. `eth_newFilter`), then `watchEvent` will fall back to using [`getLogs`](https://viem.sh/docs/actions/public/getLogs) instead.
*
* @param client - Client to use
* @param parameters - {@link WatchEventParameters}
* @returns A function that can be invoked to stop watching for new Event Logs. {@link WatchEventReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { watchEvent } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const unwatch = watchEvent(client, {
*   onLogs: (logs) => console.log(logs),
* })
*/
function watchEvent(client, { address, args, batch = true, event, events, fromBlock, onError, onLogs, poll: poll_, pollingInterval = client.pollingInterval, strict: strict_ }) {
	const enablePolling = (() => {
		if (typeof poll_ !== "undefined") return poll_;
		if (typeof fromBlock === "bigint") return true;
		if (client.transport.type === "webSocket" || client.transport.type === "ipc") return false;
		if (client.transport.type === "fallback" && (client.transport.transports[0].config.type === "webSocket" || client.transport.transports[0].config.type === "ipc")) return false;
		return true;
	})();
	const strict = strict_ ?? false;
	const pollEvent = () => {
		return observe(stringify([
			"watchEvent",
			address,
			args,
			batch,
			client.uid,
			event,
			pollingInterval,
			fromBlock
		]), {
			onLogs,
			onError
		}, (emit) => {
			let previousBlockNumber;
			if (fromBlock !== void 0) previousBlockNumber = fromBlock - 1n;
			let filter;
			let initialized = false;
			const unwatch = poll(async () => {
				if (!initialized) {
					try {
						filter = await getAction(client, createEventFilter, "createEventFilter")({
							address,
							args,
							event,
							events,
							strict,
							fromBlock
						});
					} catch {}
					initialized = true;
					return;
				}
				try {
					let logs;
					if (filter) logs = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
					else {
						const blockNumber = await getAction(client, getBlockNumber, "getBlockNumber")({});
						if (previousBlockNumber && previousBlockNumber !== blockNumber) logs = await getAction(client, getLogs, "getLogs")({
							address,
							args,
							event,
							events,
							fromBlock: previousBlockNumber + 1n,
							toBlock: blockNumber
						});
						else logs = [];
						previousBlockNumber = blockNumber;
					}
					if (logs.length === 0) return;
					if (batch) emit.onLogs(logs);
					else for (const log of logs) emit.onLogs([log]);
				} catch (err) {
					if (filter && err instanceof InvalidInputRpcError) initialized = false;
					emit.onError?.(err);
				}
			}, {
				emitOnBegin: true,
				interval: pollingInterval
			});
			return async () => {
				if (filter) await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
				unwatch();
			};
		});
	};
	const subscribeEvent = () => {
		let active = true;
		let unsubscribe = () => active = false;
		(async () => {
			try {
				const transport = (() => {
					if (client.transport.type === "fallback") {
						const transport = client.transport.transports.find((transport) => transport.config.type === "webSocket" || transport.config.type === "ipc");
						if (!transport) return client.transport;
						return transport.value;
					}
					return client.transport;
				})();
				const events_ = events ?? (event ? [event] : void 0);
				let topics = [];
				if (events_) {
					topics = [events_.flatMap((event) => encodeEventTopics({
						abi: [event],
						eventName: event.name,
						args
					}))];
					if (event) topics = topics[0];
				}
				const { unsubscribe: unsubscribe_ } = await transport.subscribe({
					params: ["logs", {
						address,
						topics
					}],
					onData(data) {
						if (!active) return;
						const log = data.result;
						try {
							const { eventName, args } = decodeEventLog({
								abi: events_ ?? [],
								data: log.data,
								topics: log.topics,
								strict
							});
							onLogs([formatLog(log, {
								args,
								eventName
							})]);
						} catch (err) {
							let eventName;
							let isUnnamed;
							if (err instanceof DecodeLogDataMismatch || err instanceof DecodeLogTopicsMismatch) {
								if (strict_) return;
								eventName = err.abiItem.name;
								isUnnamed = err.abiItem.inputs?.some((x) => !("name" in x && x.name));
							}
							onLogs([formatLog(log, {
								args: isUnnamed ? [] : {},
								eventName
							})]);
						}
					},
					onError(error) {
						onError?.(error);
					}
				});
				unsubscribe = unsubscribe_;
				if (!active) unsubscribe();
			} catch (err) {
				onError?.(err);
			}
		})();
		return () => unsubscribe();
	};
	return enablePolling ? pollEvent() : subscribeEvent();
}
//#endregion
//#region node_modules/viem/_esm/actions/public/watchPendingTransactions.js
/**
* Watches and returns pending transaction hashes.
*
* - Docs: https://viem.sh/docs/actions/public/watchPendingTransactions
* - JSON-RPC Methods:
*   - When `poll: true`
*     - Calls [`eth_newPendingTransactionFilter`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newpendingtransactionfilter) to initialize the filter.
*     - Calls [`eth_getFilterChanges`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_getFilterChanges) on a polling interval.
*   - When `poll: false` & WebSocket Transport, uses a WebSocket subscription via [`eth_subscribe`](https://docs.alchemy.com/reference/eth-subscribe-polygon) and the `"newPendingTransactions"` event.
*
* This Action will batch up all the pending transactions found within the [`pollingInterval`](https://viem.sh/docs/actions/public/watchPendingTransactions#pollinginterval-optional), and invoke them via [`onTransactions`](https://viem.sh/docs/actions/public/watchPendingTransactions#ontransactions).
*
* @param client - Client to use
* @param parameters - {@link WatchPendingTransactionsParameters}
* @returns A function that can be invoked to stop watching for new pending transaction hashes. {@link WatchPendingTransactionsReturnType}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { watchPendingTransactions } from 'viem/public'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
* const unwatch = await watchPendingTransactions(client, {
*   onTransactions: (hashes) => console.log(hashes),
* })
*/
function watchPendingTransactions(client, { batch = true, onError, onTransactions, poll: poll_, pollingInterval = client.pollingInterval }) {
	const enablePolling = typeof poll_ !== "undefined" ? poll_ : client.transport.type !== "webSocket" && client.transport.type !== "ipc";
	const pollPendingTransactions = () => {
		return observe(stringify([
			"watchPendingTransactions",
			client.uid,
			batch,
			pollingInterval
		]), {
			onTransactions,
			onError
		}, (emit) => {
			let filter;
			const unwatch = poll(async () => {
				try {
					if (!filter) try {
						filter = await getAction(client, createPendingTransactionFilter, "createPendingTransactionFilter")({});
						return;
					} catch (err) {
						unwatch();
						throw err;
					}
					const hashes = await getAction(client, getFilterChanges, "getFilterChanges")({ filter });
					if (hashes.length === 0) return;
					if (batch) emit.onTransactions(hashes);
					else for (const hash of hashes) emit.onTransactions([hash]);
				} catch (err) {
					emit.onError?.(err);
				}
			}, {
				emitOnBegin: true,
				interval: pollingInterval
			});
			return async () => {
				if (filter) await getAction(client, uninstallFilter, "uninstallFilter")({ filter });
				unwatch();
			};
		});
	};
	const subscribePendingTransactions = () => {
		let active = true;
		let unsubscribe = () => active = false;
		(async () => {
			try {
				const { unsubscribe: unsubscribe_ } = await client.transport.subscribe({
					params: ["newPendingTransactions"],
					onData(data) {
						if (!active) return;
						const transaction = data.result;
						onTransactions([transaction]);
					},
					onError(error) {
						onError?.(error);
					}
				});
				unsubscribe = unsubscribe_;
				if (!active) unsubscribe();
			} catch (err) {
				onError?.(err);
			}
		})();
		return () => unsubscribe();
	};
	return enablePolling ? pollPendingTransactions() : subscribePendingTransactions();
}
//#endregion
//#region node_modules/viem/_esm/utils/siwe/parseSiweMessage.js
var siweDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;
function isValidSiweDateTime(value) {
	if (!siweDateTimeRegex.test(value)) return false;
	return !Number.isNaN(new Date(value).getTime());
}
function parseSiweDateTime(value) {
	if (!isValidSiweDateTime(value)) return /* @__PURE__ */ new Date(NaN);
	return new Date(value);
}
/**
* @description Parses EIP-4361 formatted message into message fields object.
*
* @see https://eips.ethereum.org/EIPS/eip-4361
*
* @returns EIP-4361 fields object
*/
function parseSiweMessage(message) {
	const { scheme, statement, ...prefix } = message.match(prefixRegex)?.groups ?? {};
	const { chainId, expirationTime, issuedAt, notBefore, requestId, resources: resources_, ...suffix } = message.match(suffixRegex)?.groups ?? {};
	const resources = resources_?.split("\n- ").slice(1);
	return {
		...prefix,
		...suffix,
		...chainId ? { chainId: Number(chainId) } : {},
		...expirationTime ? { expirationTime: parseSiweDateTime(expirationTime) } : {},
		...issuedAt ? { issuedAt: parseSiweDateTime(issuedAt) } : {},
		...notBefore ? { notBefore: parseSiweDateTime(notBefore) } : {},
		...requestId ? { requestId } : {},
		...resources ? { resources } : {},
		...scheme ? { scheme } : {},
		...statement ? { statement } : {}
	};
}
var prefixRegex = /^(?:(?<scheme>[a-zA-Z][a-zA-Z0-9+\-.]*):\/\/)?(?<domain>[a-zA-Z0-9+-.]*(?::[0-9]{1,5})?) (?:wants you to sign in with your Ethereum account:\n)(?<address>0x[a-fA-F0-9]{40})\n\n(?:(?<statement>.*)\n\n)?/;
var suffixRegex = /(?:URI: (?<uri>.+))\n(?:Version: (?<version>.+))\n(?:Chain ID: (?<chainId>\d+))\n(?:Nonce: (?<nonce>[a-zA-Z0-9]+))\n(?:Issued At: (?<issuedAt>.+))(?:\nExpiration Time: (?<expirationTime>.+))?(?:\nNot Before: (?<notBefore>.+))?(?:\nRequest ID: (?<requestId>.*))?(?:\nResources:(?<resources>(?:\n- .+)*))?/;
//#endregion
//#region node_modules/viem/_esm/utils/siwe/validateSiweMessage.js
/**
* @description Validates EIP-4361 message.
*
* @see https://eips.ethereum.org/EIPS/eip-4361
*/
function validateSiweMessage(parameters) {
	const { address, domain, message, nonce, scheme, time = /* @__PURE__ */ new Date() } = parameters;
	if (domain && message.domain !== domain) return false;
	if (nonce && message.nonce !== nonce) return false;
	if (scheme && message.scheme !== scheme) return false;
	if (Number.isNaN(time.getTime())) return false;
	if (message.expirationTime) {
		if (Number.isNaN(message.expirationTime.getTime())) return false;
		if (time >= message.expirationTime) return false;
	}
	if (message.notBefore) {
		if (Number.isNaN(message.notBefore.getTime())) return false;
		if (time < message.notBefore) return false;
	}
	try {
		if (!message.address) return false;
		if (!isAddress(message.address, { strict: false })) return false;
		if (address && !isAddressEqual(message.address, address)) return false;
	} catch {
		return false;
	}
	return true;
}
//#endregion
//#region node_modules/viem/_esm/actions/siwe/verifySiweMessage.js
/**
* Verifies [EIP-4361](https://eips.ethereum.org/EIPS/eip-4361) formatted message was signed.
*
* Compatible with Smart Contract Accounts & Externally Owned Accounts via [ERC-6492](https://eips.ethereum.org/EIPS/eip-6492).
*
* - Docs {@link https://viem.sh/docs/siwe/actions/verifySiweMessage}
*
* @param client - Client to use.
* @param parameters - {@link VerifySiweMessageParameters}
* @returns Whether or not the signature is valid. {@link VerifySiweMessageReturnType}
*/
async function verifySiweMessage(client, parameters) {
	const { address, domain, message, nonce, scheme, signature, time = /* @__PURE__ */ new Date(), ...callRequest } = parameters;
	const parsed = parseSiweMessage(message);
	if (!parsed.address) return false;
	if (!validateSiweMessage({
		address,
		domain,
		message: parsed,
		nonce,
		scheme,
		time
	})) return false;
	const hash = hashMessage(message);
	return verifyHash(client, {
		address: parsed.address,
		hash,
		signature,
		...callRequest
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/token/internal.js
/**
* Shapes a base-unit value into an {@link Amount} (base units, `decimals`, and
* human-readable `formatted` string).
*
* @param amount - Amount in base units.
* @param decimals - Token decimals used to format the amount.
* @returns The {@link Amount}.
*/
function toAmount(amount, decimals) {
	return {
		amount,
		decimals,
		formatted: formatUnits(amount, decimals)
	};
}
/**
* Resolves a write amount to base units.
*
* @param amount - Base-unit amount, or formatted helper.
* @param decimals - Token decimals used to parse formatted amounts.
* @returns Amount in base units.
*/
function toBaseUnits(amount, decimals) {
	if (typeof amount === "bigint") return amount;
	const resolved = amount.decimals ?? decimals;
	return parseUnits(amount.formatted, requireTokenDecimals(resolved));
}
/**
* Requires resolved token decimals for parsing or formatting amounts.
*
* @param decimals - Token decimals.
* @returns Token decimals.
* @internal
*/
function requireTokenDecimals(decimals) {
	if (decimals === void 0) throw new Error("Token decimals are required. Pass `amount.decimals` or select a declared token.");
	return decimals;
}
/**
* Resolves the decimals used for formatting a write amount.
*
* @param amount - Base-unit amount, or formatted helper.
* @param decimals - Token decimals.
* @returns Token decimals, overridden by the formatted helper when present.
*/
function resolveAmountDecimals(amount, decimals) {
	if (typeof amount === "bigint") return decimals;
	return amount.decimals ?? decimals;
}
/**
* Resolves the token contract `address` and `decimals` from a `token`, which is
* either the symbol of a token declared on the client's `tokens` array or a
* contract `address`.
*
* When `token` is a declared symbol, the `address` and `decimals` are resolved
* from the Client's `tokens` array for the Client's `chain.id` (`decimals` can
* be overridden via the explicit `decimals`). When `token` is an address, its
* `decimals` is inferred from the Client's `tokens` array when the address
* matches a declared token, otherwise taken from the explicit `decimals`.
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The resolved `address` and `decimals`.
*/
function resolveToken(client, parameters) {
	const { decimals, token } = parameters;
	const declared = findDeclaredToken(client, token);
	if (declared) return {
		address: declared.address,
		decimals: decimals ?? declared.decimals
	};
	if (isAddress(token, { strict: false })) return {
		address: token,
		decimals: decimals ?? inferDecimals(client, token)
	};
	throw new Error(`Token "${token}" is not a declared ERC-20 token on the client's \`tokens\` array (with an address for the client's chain), and is not a valid address.`);
}
/**
* Finds the declared token on the Client's `tokens` array matching `token`
* (either a token symbol or contract `address`), resolved to a {@link ResolvedToken}
* for the Client's `chain.id`. Returns `undefined` when no declared token
* matches, or the matching token has no address for the Client's chain.
*
* @param client - Client.
* @param token - Token symbol (declared on the client's `tokens` array) or contract address.
* @returns The matching resolved token config, or `undefined`.
*/
function findDeclaredToken(client, token) {
	const tokens = client.tokens;
	const chainId = client.chain?.id;
	if (!tokens || chainId === void 0) return void 0;
	const bySymbol = findTokenBySymbol(tokens, token);
	if (bySymbol) return resolveTokenForChain(bySymbol, chainId);
	if (isAddress(token, { strict: false })) for (const token_ of tokens) {
		const resolved = resolveTokenForChain(token_, chainId);
		if (resolved && isAddressEqual(resolved.address, token)) return resolved;
	}
}
/**
* Resolves a {@link Token} to a {@link ResolvedToken} for `chainId`, or
* `undefined` when the token has no address for `chainId`. @internal
*/
function resolveTokenForChain(token, chainId) {
	const address = token.addresses[chainId];
	if (!address) return void 0;
	return {
		address,
		currency: token.currency,
		decimals: token.decimals,
		name: token.name,
		popular: token.popular,
		symbol: token.symbol
	};
}
/** Finds a {@link Token} by symbol (case-insensitively) on a `tokens` array. @internal */
function findTokenBySymbol(tokens, symbol) {
	const lowerSymbol = symbol.toLowerCase();
	for (const token of tokens) if (token.symbol?.toLowerCase() === lowerSymbol) return token;
}
/**
* Infers a token's `decimals` from the Client's `tokens` array by matching
* `address` against each token's address for the Client's `chain.id`.
* @internal
*/
function inferDecimals(client, address) {
	const tokens = client.tokens;
	const chainId = client.chain?.id;
	if (tokens && chainId !== void 0) for (const token of tokens) {
		const resolved = resolveTokenForChain(token, chainId);
		if (resolved && isAddressEqual(resolved.address, address)) return resolved.decimals;
	}
}
/**
* Resolves token decimals, fetching from the token contract when they are not
* provided explicitly or declared on the client.
* @internal
*/
async function resolveTokenWithDecimals(client, parameters) {
	const { address, decimals } = resolveToken(client, parameters);
	if (decimals !== void 0) return {
		address,
		decimals
	};
	return {
		address,
		decimals: await readContract(client, {
			abi: erc20Abi,
			address,
			functionName: "decimals"
		})
	};
}
/**
* Picks the transaction-override fields shared by write actions, so the
* action-specific args (`token`, `amount`, `to`, etc.) don't leak into
* `estimateContractGas` / `simulateContract` requests. @internal
*/
function pickWriteParameters(parameters) {
	const { account, chain, gas, maxFeePerGas, maxPriorityFeePerGas, nonce } = parameters;
	return {
		account,
		chain,
		gas,
		maxFeePerGas,
		maxPriorityFeePerGas,
		nonce
	};
}
function defineCall(call) {
	return {
		...call,
		data: encodeFunctionData(call),
		to: call.address
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/token/approve.js
/**
* Approves a spender to transfer ERC-20 tokens on behalf of the caller.
*
* @example
* ```ts
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { privateKeyToAccount } from 'viem/accounts'
* import { token } from 'viem/actions'
*
* const client = createClient({
*   account: privateKeyToAccount('0x...'),
*   chain: mainnet,
*   transport: http(),
* })
*
* const hash = await token.approve(client, {
*   amount: 100000000n,
*   spender: '0x...',
*   token: '0x...',
* })
* ```
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The transaction hash.
*/
async function approve(client, parameters) {
	return approve.inner(writeContract, client, parameters);
}
(function(approve) {
	/** @internal */
	async function inner(action, client, parameters) {
		return await action(client, {
			...parameters,
			...approve.call(client, parameters)
		});
	}
	approve.inner = inner;
	/**
	* Defines a call to the `approve` function.
	*
	* Can be passed as a parameter to `estimateContractGas`, `simulateContract`,
	* `sendCalls`, `sendTransaction` (`calls`), or `multicall`. The token is
	* selected by `token`, which is either a token symbol (resolved from the
	* client's `tokens` array) or a contract `address`; `amount.decimals`
	* is inferred from declared client tokens when omitted.
	*
	* @param client - Client.
	* @param parameters - Parameters.
	* @returns The call.
	*/
	function call(client, parameters) {
		return defineCall(getCall$1(client, parameters));
	}
	approve.call = call;
	/**
	* Estimates the gas required to approve a spender. `amount.decimals` is
	* inferred from declared client tokens when omitted.
	*
	* @param client - Client.
	* @param parameters - Parameters.
	* @returns The gas estimate.
	*/
	async function estimateGas(client, parameters) {
		return estimateContractGas(client, {
			...pickWriteParameters(parameters),
			...approve.call(client, parameters)
		});
	}
	approve.estimateGas = estimateGas;
	/**
	* Simulates an approval of a spender. `amount.decimals` is inferred from
	* declared client tokens when omitted.
	*
	* @param client - Client.
	* @param parameters - Parameters.
	* @returns The simulation result and write request.
	*/
	async function simulate(client, parameters) {
		return simulateContract(client, {
			...pickWriteParameters(parameters),
			...approve.call(client, parameters)
		});
	}
	approve.simulate = simulate;
	/**
	* Extracts the `Approval` event from logs.
	*
	* @param logs - The logs.
	* @returns The `Approval` event.
	*/
	function extractEvent(logs) {
		const [log] = parseEventLogs({
			abi: erc20Abi,
			logs,
			eventName: "Approval",
			strict: true
		});
		if (!log) throw new Error("`Approval` event not found.");
		return log;
	}
	approve.extractEvent = extractEvent;
})(approve || (approve = {}));
/** Builds the underlying `approve` contract call. @internal */
function getCall$1(client, parameters) {
	const { amount, spender, token } = parameters;
	const { address, decimals } = resolveToken(client, { token });
	return {
		abi: erc20Abi,
		address,
		args: [spender, toBaseUnits(amount, decimals)],
		functionName: "approve"
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/sendRawTransactionSync.js
/**
* Sends a **signed** transaction to the network synchronously,
* and waits for the transaction to be included in a block.
*
* - Docs: https://viem.sh/docs/actions/wallet/sendRawTransactionSync
* - JSON-RPC Method: [`eth_sendRawTransactionSync`](https://eips.ethereum.org/EIPS/eip-7966)
*
* @param client - Client to use
* @param parameters - {@link SendRawTransactionParameters}
* @returns The transaction receipt. {@link SendRawTransactionSyncReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { sendRawTransactionSync } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
*
* const receipt = await sendRawTransactionSync(client, {
*   serializedTransaction: '0x02f850018203118080825208808080c080a04012522854168b27e5dc3d5839bab5e6b39e1a0ffd343901ce1622e3d64b48f1a04e00902ae0502c4728cbf12156290df99c3ed7de85b1dbfe20b5c36931733a33'
* })
*/
async function sendRawTransactionSync(client, { serializedTransaction, throwOnReceiptRevert, timeout }) {
	const receipt = await client.request({
		method: "eth_sendRawTransactionSync",
		params: timeout ? [serializedTransaction, timeout] : [serializedTransaction]
	}, { retryCount: 0 });
	const formatted = (client.chain?.formatters?.transactionReceipt?.format || formatTransactionReceipt)(receipt);
	if (formatted.status === "reverted" && throwOnReceiptRevert) throw new TransactionReceiptRevertedError({ receipt: formatted });
	return formatted;
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/sendTransactionSync.js
var supportsWalletNamespace = new LruMap(128);
/**
* Creates, signs, and sends a new transaction to the network synchronously.
* Returns the transaction receipt.
*
* @param client - Client to use
* @param parameters - {@link SendTransactionSyncParameters}
* @returns The transaction receipt. {@link SendTransactionSyncReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { sendTransactionSync } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const receipt = await sendTransactionSync(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*   value: 1000000000000000000n,
* })
*
* @example
* // Account Hoisting
* import { createWalletClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { sendTransactionSync } from 'viem/wallet'
*
* const client = createWalletClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: http(),
* })
* const receipt = await sendTransactionSync(client, {
*   to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*   value: 1000000000000000000n,
* })
*/
async function sendTransactionSync(client, parameters) {
	const { account: account_ = client.account, assertChainId = true, chain = client.chain, accessList, authorizationList, blobs, data, dataSuffix = typeof client.dataSuffix === "string" ? client.dataSuffix : client.dataSuffix?.value, gas, gasPrice, maxFeePerBlobGas, maxFeePerGas, maxPriorityFeePerGas, nonce, pollingInterval, throwOnReceiptRevert, type, value, ...rest } = parameters;
	const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5e3);
	if (typeof account_ === "undefined") throw new AccountNotFoundError({ docsPath: "/docs/actions/wallet/sendTransactionSync" });
	const account = account_ ? parseAccount(account_) : null;
	let nonceManagerParameters;
	try {
		assertRequest(parameters);
		const to = await (async () => {
			if (parameters.to) return parameters.to;
			if (parameters.to === null) return void 0;
			if (authorizationList && authorizationList.length > 0) return await recoverAuthorizationAddress({ authorization: authorizationList[0] }).catch(() => {
				throw new BaseError("`to` is required. Could not infer from `authorizationList`.");
			});
		})();
		if (account?.type === "json-rpc" || account === null) {
			let chainId;
			if (chain !== null) {
				chainId = await getAction(client, getChainId, "getChainId")({});
				if (assertChainId) assertCurrentChain({
					currentChainId: chainId,
					chain
				});
			}
			const chainFormat = client.chain?.formatters?.transactionRequest?.format;
			const request = (chainFormat || formatTransactionRequest)({
				...extract(rest, { format: chainFormat }),
				accessList,
				account,
				authorizationList,
				blobs,
				chainId,
				data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
				gas,
				gasPrice,
				maxFeePerBlobGas,
				maxFeePerGas,
				maxPriorityFeePerGas,
				nonce,
				to,
				type,
				value
			}, "sendTransaction");
			const isWalletNamespaceSupported = supportsWalletNamespace.get(client.uid);
			const method = isWalletNamespaceSupported ? "wallet_sendTransaction" : "eth_sendTransaction";
			const hash = await (async () => {
				try {
					return await client.request({
						method,
						params: [request]
					}, { retryCount: 0 });
				} catch (e) {
					if (isWalletNamespaceSupported === false) throw e;
					const error = e;
					if (error.name === "InvalidInputRpcError" || error.name === "InvalidParamsRpcError" || error.name === "MethodNotFoundRpcError" || error.name === "MethodNotSupportedRpcError") return await client.request({
						method: "wallet_sendTransaction",
						params: [request]
					}, { retryCount: 0 }).then((hash) => {
						supportsWalletNamespace.set(client.uid, true);
						return hash;
					}).catch((e) => {
						const walletNamespaceError = e;
						if (walletNamespaceError.name === "MethodNotFoundRpcError" || walletNamespaceError.name === "MethodNotSupportedRpcError") {
							supportsWalletNamespace.set(client.uid, false);
							throw error;
						}
						throw walletNamespaceError;
					});
					throw error;
				}
			})();
			const receipt = await getAction(client, waitForTransactionReceipt, "waitForTransactionReceipt")({
				checkReplacement: false,
				hash,
				pollingInterval,
				timeout
			});
			if (throwOnReceiptRevert && receipt.status === "reverted") throw new TransactionReceiptRevertedError({ receipt });
			return receipt;
		}
		if (account?.type === "local") {
			const nonceManager = (() => {
				if (!account.nonceManager || typeof nonce !== "undefined") return account.nonceManager;
				const nonceManager = account.nonceManager;
				return {
					consume(parameters) {
						nonceManagerParameters = {
							address: parameters.address,
							chainId: parameters.chainId
						};
						return nonceManager.consume(parameters);
					},
					get(parameters) {
						return nonceManager.get(parameters);
					},
					increment(parameters) {
						return nonceManager.increment(parameters);
					},
					reset(parameters) {
						return nonceManager.reset(parameters);
					}
				};
			})();
			const request = await getAction(client, prepareTransactionRequest, "prepareTransactionRequest")({
				account,
				accessList,
				authorizationList,
				blobs,
				chain,
				data: dataSuffix ? concat([data ?? "0x", dataSuffix]) : data,
				gas,
				gasPrice,
				maxFeePerBlobGas,
				maxFeePerGas,
				maxPriorityFeePerGas,
				nonce,
				nonceManager,
				parameters: [...defaultParameters, "sidecars"],
				type,
				value,
				...rest,
				to
			});
			const serializer = chain?.serializers?.transaction;
			const signedTransaction = await account.signTransaction(request, { serializer });
			const transactionEnvelope = (chain ?? client.chain)?.serializers?.transactionEnvelope;
			const serializedTransaction = transactionEnvelope ? await transactionEnvelope({
				serializedTransaction: signedTransaction,
				transaction: request
			}) : signedTransaction;
			return await getAction(client, sendRawTransactionSync, "sendRawTransactionSync")({
				serializedTransaction,
				throwOnReceiptRevert,
				timeout: parameters.timeout
			});
		}
		if (account?.type === "smart") throw new AccountTypeNotSupportedError({
			metaMessages: ["Consider using the `sendUserOperation` Action instead."],
			docsPath: "/docs/actions/bundler/sendUserOperation",
			type: "smart"
		});
		throw new AccountTypeNotSupportedError({
			docsPath: "/docs/actions/wallet/sendTransactionSync",
			type: account?.type
		});
	} catch (err) {
		if (err instanceof AccountTypeNotSupportedError) throw err;
		if (nonceManagerParameters && !(err instanceof TransactionReceiptRevertedError)) account?.nonceManager?.reset(nonceManagerParameters);
		throw getTransactionError(err, {
			...parameters,
			account,
			chain: parameters.chain || void 0
		});
	}
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/writeContractSync.js
/**
* Executes a write function on a contract synchronously.
* Returns the transaction receipt.
*
* - Docs: https://viem.sh/docs/contract/writeContractSync
*
* A "write" function on a Solidity contract modifies the state of the blockchain. These types of functions require gas to be executed, and hence a [Transaction](https://viem.sh/docs/glossary/terms) is needed to be broadcast in order to change the state.
*
* Internally, uses a [Wallet Client](https://viem.sh/docs/clients/wallet) to call the [`sendTransaction` action](https://viem.sh/docs/actions/wallet/sendTransaction) with [ABI-encoded `data`](https://viem.sh/docs/contract/encodeFunctionData).
*
* __Warning: The `write` internally sends a transaction – it does not validate if the contract write will succeed (the contract may throw an error). It is highly recommended to [simulate the contract write with `contract.simulate`](https://viem.sh/docs/contract/writeContract#usage) before you execute it.__
*
* @param client - Client to use
* @param parameters - {@link WriteContractParameters}
* @returns A [Transaction Hash](https://viem.sh/docs/glossary/terms#hash). {@link WriteContractReturnType}
*
* @example
* import { createWalletClient, custom, parseAbi } from 'viem'
* import { mainnet } from 'viem/chains'
* import { writeContract } from 'viem/contract'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const receipt = await writeContractSync(client, {
*   address: '0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2',
*   abi: parseAbi(['function mint(uint32 tokenId) nonpayable']),
*   functionName: 'mint',
*   args: [69420],
* })
*/
async function writeContractSync(client, parameters) {
	return writeContract.internal(client, sendTransactionSync, "sendTransactionSync", parameters);
}
//#endregion
//#region node_modules/viem/_esm/actions/token/approveSync.js
/**
* Approves a spender to transfer ERC-20 tokens on behalf of the caller, and
* waits for the transaction to be confirmed.
*
* @example
* ```ts
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { privateKeyToAccount } from 'viem/accounts'
* import { token } from 'viem/actions'
*
* const client = createClient({
*   account: privateKeyToAccount('0x...'),
*   chain: mainnet,
*   transport: http(),
* })
*
* const { receipt, ...event } = await token.approveSync(client, {
*   amount: 100000000n,
*   spender: '0x...',
*   token: '0x...',
* })
* ```
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The transaction receipt and event data.
*/
async function approveSync(client, parameters) {
	const { amount, token, throwOnReceiptRevert = true } = parameters;
	const { decimals } = resolveToken(client, { token });
	const resolved = resolveAmountDecimals(amount, decimals);
	const receipt = await approve.inner(writeContractSync, client, {
		...parameters,
		throwOnReceiptRevert
	});
	const { args } = approve.extractEvent(receipt.logs);
	return {
		...args,
		...resolved === void 0 ? {} : {
			decimals: resolved,
			formatted: formatUnits(args.value, resolved)
		},
		receipt
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/token/getAllowance.js
/**
* Gets the ERC-20 allowance a spender has over an account's tokens.
*
* @example
* ```ts
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { token } from 'viem/actions'
*
* const client = createClient({ chain: mainnet, transport: http() })
*
* const allowance = await token.getAllowance(client, {
*   account: '0x...',
*   spender: '0x...',
*   token: '0x...',
* })
* ```
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The allowance, in base units and human-readable form.
*/
async function getAllowance(client, parameters) {
	const { account, decimals, spender, token, ...rest } = parameters;
	const [amount, { decimals: resolved }] = await Promise.all([readContract(client, {
		...rest,
		...getAllowance.call(client, {
			account,
			spender,
			token
		})
	}), resolveTokenWithDecimals(client, {
		decimals,
		token
	})]);
	return toAmount(amount, resolved);
}
(function(getAllowance) {
	/**
	* Defines a call to the `allowance` function.
	*
	* Can be passed as a parameter to `multicall`, `simulateContract`, or any
	* other action that accepts a contract call. The token is selected by `token`
	* symbol (resolved from the client's `tokens` array) or contract address.
	*
	* @param client - Client.
	* @param args - Arguments.
	* @returns The call.
	*/
	function call(client, args) {
		return defineCall({
			address: resolveToken(client, args).address,
			abi: erc20Abi,
			functionName: "allowance",
			args: [args.account, args.spender]
		});
	}
	getAllowance.call = call;
})(getAllowance || (getAllowance = {}));
//#endregion
//#region node_modules/viem/_esm/actions/token/getBalance.js
/**
* Gets the ERC-20 token balance of an account.
*
* @example
* ```ts
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { token } from 'viem/actions'
*
* const client = createClient({ chain: mainnet, transport: http() })
*
* const balance = await token.getBalance(client, {
*   account: '0x...',
*   token: '0x...',
* })
* ```
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The token balance, in base units and human-readable form.
*/
async function getBalance(client, parameters) {
	const { account: account_ = client.account, decimals, token, ...rest } = parameters;
	if (!account_) throw new AccountNotFoundError();
	const account = parseAccount(account_).address;
	const [amount, { decimals: resolved }] = await Promise.all([readContract(client, {
		...rest,
		...getBalance.call(client, {
			account,
			token
		})
	}), resolveTokenWithDecimals(client, {
		decimals,
		token
	})]);
	return toAmount(amount, resolved);
}
(function(getBalance) {
	/**
	* Defines a call to the `balanceOf` function.
	*
	* Can be passed as a parameter to `multicall`, `simulateContract`, or any
	* other action that accepts a contract call. The token is selected by `token`
	* symbol (resolved from the client's `tokens` array) or contract address.
	*
	* @param client - Client.
	* @param args - Arguments.
	* @returns The call.
	*/
	function call(client, args) {
		const account_ = args.account ?? client.account;
		if (!account_) throw new AccountNotFoundError();
		const account = parseAccount(account_).address;
		return defineCall({
			address: resolveToken(client, args).address,
			abi: erc20Abi,
			functionName: "balanceOf",
			args: [account]
		});
	}
	getBalance.call = call;
})(getBalance || (getBalance = {}));
//#endregion
//#region node_modules/viem/_esm/actions/token/getMetadata.js
/**
* Gets the metadata (`decimals`, `name`, `symbol`) of an ERC-20 token.
*
* Fields declared on the Client's `tokens` array are used as-is; any missing
* field is fetched from the token contract.
*
* @example
* ```ts
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { token } from 'viem/actions'
*
* const client = createClient({ chain: mainnet, transport: http() })
*
* const metadata = await token.getMetadata(client, {
*   token: '0x...',
* })
* ```
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The token metadata (`decimals`, `name`, `symbol`).
*/
async function getMetadata(client, parameters) {
	const { token, ...rest } = parameters;
	const { address } = resolveToken(client, { token });
	const declared = findDeclaredToken(client, token);
	const [decimals_, name, symbol] = await Promise.all([
		declared?.decimals ?? readContract(client, {
			...rest,
			abi: erc20Abi,
			address,
			functionName: "decimals"
		}),
		declared?.name ?? readContract(client, {
			...rest,
			abi: erc20Abi,
			address,
			functionName: "name"
		}),
		declared?.symbol ?? readContract(client, {
			...rest,
			abi: erc20Abi,
			address,
			functionName: "symbol"
		})
	]);
	return {
		decimals: decimals_,
		name,
		symbol
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/token/getTotalSupply.js
/**
* Gets the total supply of an ERC-20 token.
*
* @example
* ```ts
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { token } from 'viem/actions'
*
* const client = createClient({ chain: mainnet, transport: http() })
*
* const totalSupply = await token.getTotalSupply(client, {
*   token: '0x...',
* })
* ```
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The token total supply, in base units and human-readable form.
*/
async function getTotalSupply(client, parameters) {
	const { decimals, token, ...rest } = parameters;
	const [amount, { decimals: resolved }] = await Promise.all([readContract(client, {
		...rest,
		...getTotalSupply.call(client, { token })
	}), resolveTokenWithDecimals(client, {
		decimals,
		token
	})]);
	return toAmount(amount, resolved);
}
(function(getTotalSupply) {
	/**
	* Defines a call to the `totalSupply` function.
	*
	* Can be passed as a parameter to `multicall`, `simulateContract`, or any
	* other action that accepts a contract call. The token is selected by `token`
	* symbol (resolved from the client's `tokens` array) or contract address.
	*
	* @param client - Client.
	* @param args - Arguments.
	* @returns The call.
	*/
	function call(client, args) {
		return defineCall({
			address: resolveToken(client, args).address,
			abi: erc20Abi,
			args: [],
			functionName: "totalSupply"
		});
	}
	getTotalSupply.call = call;
})(getTotalSupply || (getTotalSupply = {}));
//#endregion
//#region node_modules/viem/_esm/actions/token/transfer.js
/**
* Transfers ERC-20 tokens to another address.
*
* Pass `from` to transfer on behalf of another address using an allowance
* (calls `transferFrom`); otherwise transfers from the caller (calls
* `transfer`).
*
* @example
* ```ts
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { privateKeyToAccount } from 'viem/accounts'
* import { token } from 'viem/actions'
*
* const client = createClient({
*   account: privateKeyToAccount('0x...'),
*   chain: mainnet,
*   transport: http(),
* })
*
* const hash = await token.transfer(client, {
*   amount: 100000000n,
*   to: '0x...',
*   token: '0x...',
* })
* ```
*
* @example
* ```ts
* // Transfer on behalf of another address (via an allowance).
* const hash = await token.transfer(client, {
*   amount: 100000000n,
*   from: '0x...',
*   to: '0x...',
*   token: '0x...',
* })
* ```
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The transaction hash.
*/
async function transfer(client, parameters) {
	return transfer.inner(writeContract, client, parameters);
}
(function(transfer) {
	/** @internal */
	async function inner(action, client, parameters) {
		return await action(client, {
			...parameters,
			...transfer.call(client, parameters)
		});
	}
	transfer.inner = inner;
	/**
	* Defines a call to the `transfer` (or `transferFrom`, when `from` is given)
	* function.
	*
	* Can be passed as a parameter to `estimateContractGas`, `simulateContract`,
	* `sendCalls`, `sendTransaction` (`calls`), or `multicall`. The token is
	* selected by `token`, which is either a token symbol (resolved from the
	* client's `tokens` array) or a contract `address`; `amount.decimals`
	* is inferred from declared client tokens when omitted.
	*
	* @param client - Client.
	* @param parameters - Parameters.
	* @returns The call.
	*/
	function call(client, parameters) {
		return defineCall(getCall(client, parameters));
	}
	transfer.call = call;
	/**
	* Estimates the gas required to transfer ERC-20 tokens. `amount.decimals` is
	* inferred from declared client tokens when omitted.
	*
	* @param client - Client.
	* @param parameters - Parameters.
	* @returns The gas estimate.
	*/
	async function estimateGas(client, parameters) {
		return estimateContractGas(client, {
			...pickWriteParameters(parameters),
			...transfer.call(client, parameters)
		});
	}
	transfer.estimateGas = estimateGas;
	/**
	* Simulates a transfer of ERC-20 tokens. `amount.decimals` is inferred from
	* declared client tokens when omitted.
	*
	* @param client - Client.
	* @param parameters - Parameters.
	* @returns The simulation result and write request.
	*/
	async function simulate(client, parameters) {
		return simulateContract(client, {
			...pickWriteParameters(parameters),
			...transfer.call(client, parameters)
		});
	}
	transfer.simulate = simulate;
	/**
	* Extracts the `Transfer` event from logs.
	*
	* @param logs - The logs.
	* @returns The `Transfer` event.
	*/
	function extractEvent(logs) {
		const [log] = parseEventLogs({
			abi: erc20Abi,
			logs,
			eventName: "Transfer",
			strict: true
		});
		if (!log) throw new Error("`Transfer` event not found.");
		return log;
	}
	transfer.extractEvent = extractEvent;
})(transfer || (transfer = {}));
/** Builds the underlying `transfer`/`transferFrom` contract call. @internal */
function getCall(client, parameters) {
	const { amount, from, to, token } = parameters;
	const { address, decimals } = resolveToken(client, { token });
	const value = toBaseUnits(amount, decimals);
	if (from) return {
		abi: erc20Abi,
		address,
		args: [
			from,
			to,
			value
		],
		functionName: "transferFrom"
	};
	return {
		abi: erc20Abi,
		address,
		args: [to, value],
		functionName: "transfer"
	};
}
//#endregion
//#region node_modules/viem/_esm/actions/token/transferSync.js
/**
* Transfers ERC-20 tokens to another address, and waits for the transaction to
* be confirmed.
*
* Pass `from` to transfer on behalf of another address using an allowance
* (calls `transferFrom`); otherwise transfers from the caller (calls
* `transfer`).
*
* @example
* ```ts
* import { createClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
* import { privateKeyToAccount } from 'viem/accounts'
* import { token } from 'viem/actions'
*
* const client = createClient({
*   account: privateKeyToAccount('0x...'),
*   chain: mainnet,
*   transport: http(),
* })
*
* const { receipt, ...event } = await token.transferSync(client, {
*   amount: 100000000n,
*   to: '0x...',
*   token: '0x...',
* })
* ```
*
* @param client - Client.
* @param parameters - Parameters.
* @returns The transaction receipt and event data.
*/
async function transferSync(client, parameters) {
	const { amount, token, throwOnReceiptRevert = true } = parameters;
	const { decimals } = resolveToken(client, { token });
	const resolved = resolveAmountDecimals(amount, decimals);
	const receipt = await transfer.inner(writeContractSync, client, {
		...parameters,
		throwOnReceiptRevert
	});
	const { args } = transfer.extractEvent(receipt.logs);
	return {
		...args,
		...resolved === void 0 ? {} : {
			decimals: resolved,
			formatted: formatUnits(args.value, resolved)
		},
		receipt
	};
}
//#endregion
//#region node_modules/viem/_esm/clients/decorators/public.js
function publicActions(client) {
	return {
		call: (args) => call(client, args),
		createAccessList: (args) => createAccessList(client, args),
		createBlockFilter: () => createBlockFilter(client),
		createContractEventFilter: (args) => createContractEventFilter(client, args),
		createEventFilter: (args) => createEventFilter(client, args),
		createPendingTransactionFilter: () => createPendingTransactionFilter(client),
		estimateContractGas: (args) => estimateContractGas(client, args),
		estimateGas: (args) => estimateGas(client, args),
		getBalance: (args) => getBalance$1(client, args),
		getBlobBaseFee: () => getBlobBaseFee(client),
		getBlock: (args) => getBlock(client, args),
		getBlockNumber: (args) => getBlockNumber(client, args),
		getBlockReceipts: (args) => getBlockReceipts(client, args),
		getBlockTransactionCount: (args) => getBlockTransactionCount(client, args),
		getBytecode: (args) => getCode(client, args),
		getChainId: () => getChainId(client),
		getCode: (args) => getCode(client, args),
		getContractEvents: (args) => getContractEvents(client, args),
		getDelegation: (args) => getDelegation(client, args),
		getEip712Domain: (args) => getEip712Domain(client, args),
		getEnsAddress: (args) => getEnsAddress(client, args),
		getEnsAvatar: (args) => getEnsAvatar(client, args),
		getEnsName: (args) => getEnsName(client, args),
		getEnsResolver: (args) => getEnsResolver(client, args),
		getEnsText: (args) => getEnsText(client, args),
		getFeeHistory: (args) => getFeeHistory(client, args),
		estimateFeesPerGas: (args) => estimateFeesPerGas(client, args),
		getFilterChanges: (args) => getFilterChanges(client, args),
		getFilterLogs: (args) => getFilterLogs(client, args),
		getGasPrice: () => getGasPrice(client),
		getLogs: (args) => getLogs(client, args),
		getProof: (args) => getProof(client, args),
		estimateMaxPriorityFeePerGas: (args) => estimateMaxPriorityFeePerGas(client, args),
		fillTransaction: (args) => fillTransaction(client, args),
		getRawTransaction: (args) => getRawTransaction(client, args),
		getStorageAt: (args) => getStorageAt(client, args),
		getStorageValues: (args) => getStorageValues(client, args),
		getTransaction: (args) => getTransaction(client, args),
		getTransactionConfirmations: (args) => getTransactionConfirmations(client, args),
		getTransactionCount: (args) => getTransactionCount(client, args),
		getTransactionReceipt: (args) => getTransactionReceipt(client, args),
		multicall: (args) => multicall(client, args),
		prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
		readContract: (args) => readContract(client, args),
		sendRawTransaction: (args) => sendRawTransaction(client, args),
		sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
		simulate: (args) => simulateBlocks(client, args),
		simulateBlocks: (args) => simulateBlocks(client, args),
		simulateCalls: (args) => simulateCalls(client, args),
		simulateContract: (args) => simulateContract(client, args),
		verifyHash: (args) => verifyHash(client, args),
		verifyMessage: (args) => verifyMessage(client, args),
		verifySiweMessage: (args) => verifySiweMessage(client, args),
		verifyTypedData: (args) => verifyTypedData(client, args),
		uninstallFilter: (args) => uninstallFilter(client, args),
		waitForTransactionReceipt: (args) => waitForTransactionReceipt(client, args),
		watchBlockHeaders: (args) => watchBlockHeaders(client, args),
		watchBlocks: (args) => watchBlocks(client, args),
		watchBlockNumber: (args) => watchBlockNumber(client, args),
		watchContractEvent: (args) => watchContractEvent(client, args),
		watchEvent: (args) => watchEvent(client, args),
		watchPendingTransactions: (args) => watchPendingTransactions(client, args),
		token: bindPublicToken(client)
	};
}
/**
* Binds the read-only ERC-20 actions (and their `.call` helpers) to `client`.
* Merged with the write actions from {@link walletActions} (when present) by the
* Client's `extend`, which shallow-merges conflicting plain-object namespaces.
* @internal
*/
function bindPublicToken(client) {
	return {
		getAllowance: bindActionDecorators(client, getAllowance),
		getBalance: bindActionDecorators(client, getBalance),
		getMetadata: bindActionDecorators(client, getMetadata),
		getTotalSupply: bindActionDecorators(client, getTotalSupply)
	};
}
//#endregion
//#region node_modules/viem/_esm/clients/createPublicClient.js
/**
* Creates a Public Client with a given [Transport](https://viem.sh/docs/clients/intro) configured for a [Chain](https://viem.sh/docs/clients/chains).
*
* - Docs: https://viem.sh/docs/clients/public
*
* A Public Client is an interface to "public" [JSON-RPC API](https://ethereum.org/en/developers/docs/apis/json-rpc/) methods such as retrieving block numbers, transactions, reading from smart contracts, etc through [Public Actions](/docs/actions/public/introduction).
*
* @param config - {@link PublicClientConfig}
* @returns A Public Client. {@link PublicClient}
*
* @example
* import { createPublicClient, http } from 'viem'
* import { mainnet } from 'viem/chains'
*
* const client = createPublicClient({
*   chain: mainnet,
*   transport: http(),
* })
*/
function createPublicClient(parameters) {
	const { key = "public", name = "Public Client" } = parameters;
	return createClient({
		...parameters,
		key,
		name,
		type: "publicClient"
	}).extend(publicActions);
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/addChain.js
/**
* Adds an EVM chain to the wallet.
*
* - Docs: https://viem.sh/docs/actions/wallet/addChain
* - JSON-RPC Methods: [`eth_addEthereumChain`](https://eips.ethereum.org/EIPS/eip-3085)
*
* @param client - Client to use
* @param parameters - {@link AddChainParameters}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { optimism } from 'viem/chains'
* import { addChain } from 'viem/wallet'
*
* const client = createWalletClient({
*   transport: custom(window.ethereum),
* })
* await addChain(client, { chain: optimism })
*/
async function addChain(client, { chain }) {
	const { id, name, nativeCurrency, rpcUrls, blockExplorers } = chain;
	await client.request({
		method: "wallet_addEthereumChain",
		params: [{
			chainId: numberToHex(id),
			chainName: name,
			nativeCurrency,
			rpcUrls: rpcUrls.default.http,
			blockExplorerUrls: blockExplorers ? Object.values(blockExplorers).map(({ url }) => url) : void 0
		}]
	}, {
		dedupe: true,
		retryCount: 0
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/deployContract.js
/**
* Deploys a contract to the network, given bytecode and constructor arguments.
*
* - Docs: https://viem.sh/docs/contract/deployContract
* - Examples: https://stackblitz.com/github/wevm/viem/tree/main/examples/contracts_deploying-contracts
*
* @param client - Client to use
* @param parameters - {@link DeployContractParameters}
* @returns The [Transaction](https://viem.sh/docs/glossary/terms#transaction) hash. {@link DeployContractReturnType}
*
* @example
* import { createWalletClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { deployContract } from 'viem/contract'
*
* const client = createWalletClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: http(),
* })
* const hash = await deployContract(client, {
*   abi: [],
*   account: '0x…,
*   bytecode: '0x608060405260405161083e38038061083e833981016040819052610...',
* })
*/
function deployContract(walletClient, parameters) {
	const { abi, args, bytecode, ...request } = parameters;
	const calldata = encodeDeployData({
		abi,
		args,
		bytecode
	});
	return sendTransaction(walletClient, {
		...request,
		...request.authorizationList ? { to: null } : {},
		data: calldata
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/getAddresses.js
/**
* Returns a list of account addresses owned by the wallet or client.
*
* - Docs: https://viem.sh/docs/actions/wallet/getAddresses
* - JSON-RPC Methods: [`eth_accounts`](https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_accounts)
*
* @param client - Client to use
* @returns List of account addresses owned by the wallet or client. {@link GetAddressesReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getAddresses } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const accounts = await getAddresses(client)
*/
async function getAddresses(client) {
	if (client.account?.type === "local") return [client.account.address];
	return (await client.request({ method: "eth_accounts" }, { dedupe: true })).map((address) => checksumAddress(address));
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/getCapabilities.js
/**
* Extract capabilities that a connected wallet supports (e.g. paymasters, session keys, etc).
*
* - Docs: https://viem.sh/docs/actions/wallet/getCapabilities
* - JSON-RPC Methods: [`wallet_getCapabilities`](https://eips.ethereum.org/EIPS/eip-5792)
*
* @param client - Client to use
* @returns The wallet's capabilities. {@link GetCapabilitiesReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getCapabilities } from 'viem/actions'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const capabilities = await getCapabilities(client)
*/
async function getCapabilities(client, parameters = {}) {
	const { account = client.account, chainId } = parameters;
	const account_ = account ? parseAccount(account) : void 0;
	const params = chainId ? [account_?.address, [numberToHex(chainId)]] : [account_?.address];
	const capabilities_raw = await client.request({
		method: "wallet_getCapabilities",
		params
	});
	const capabilities = {};
	for (const [chainId, capabilities_] of Object.entries(capabilities_raw)) {
		capabilities[Number(chainId)] = {};
		for (let [key, value] of Object.entries(capabilities_)) {
			if (key === "addSubAccount") key = "unstable_addSubAccount";
			capabilities[Number(chainId)][key] = value;
		}
	}
	return typeof chainId === "number" ? capabilities[chainId] : capabilities;
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/getPermissions.js
/**
* Gets the wallets current permissions.
*
* - Docs: https://viem.sh/docs/actions/wallet/getPermissions
* - JSON-RPC Methods: [`wallet_getPermissions`](https://eips.ethereum.org/EIPS/eip-2255)
*
* @param client - Client to use
* @returns The wallet permissions. {@link GetPermissionsReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { getPermissions } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const permissions = await getPermissions(client)
*/
async function getPermissions(client) {
	return await client.request({ method: "wallet_getPermissions" }, { dedupe: true });
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/prepareAuthorization.js
/**
* Prepares an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702) object for signing.
* This Action will fill the required fields of the Authorization object if they are not provided (e.g. `nonce` and `chainId`).
*
* With the prepared Authorization object, you can use [`signAuthorization`](https://viem.sh/docs/eip7702/signAuthorization) to sign over the Authorization object.
*
* @param client - Client to use
* @param parameters - {@link PrepareAuthorizationParameters}
* @returns The prepared Authorization object. {@link PrepareAuthorizationReturnType}
*
* @example
* import { createClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { prepareAuthorization } from 'viem/experimental'
*
* const client = createClient({
*   chain: mainnet,
*   transport: http(),
* })
* const authorization = await prepareAuthorization(client, {
*   account: privateKeyToAccount('0x..'),
*   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
* })
*
* @example
* // Account Hoisting
* import { createClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { prepareAuthorization } from 'viem/experimental'
*
* const client = createClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: http(),
* })
* const authorization = await prepareAuthorization(client, {
*   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
* })
*/
async function prepareAuthorization(client, parameters) {
	const { account: account_ = client.account, chainId, nonce } = parameters;
	if (!account_) throw new AccountNotFoundError({ docsPath: "/docs/eip7702/prepareAuthorization" });
	const account = parseAccount(account_);
	const executor = (() => {
		if (!parameters.executor) return void 0;
		if (parameters.executor === "self") return parameters.executor;
		return parseAccount(parameters.executor);
	})();
	const authorization = {
		address: parameters.contractAddress ?? parameters.address,
		chainId,
		nonce
	};
	if (typeof authorization.chainId === "undefined") authorization.chainId = client.chain?.id ?? await getAction(client, getChainId, "getChainId")({});
	if (typeof authorization.nonce === "undefined") {
		authorization.nonce = await getAction(client, getTransactionCount, "getTransactionCount")({
			address: account.address,
			blockTag: "pending"
		});
		if (executor === "self" || executor?.address && isAddressEqual(executor.address, account.address)) authorization.nonce += 1;
	}
	return authorization;
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/requestAddresses.js
/**
* Requests a list of accounts managed by a wallet.
*
* - Docs: https://viem.sh/docs/actions/wallet/requestAddresses
* - JSON-RPC Methods: [`eth_requestAccounts`](https://eips.ethereum.org/EIPS/eip-1102)
*
* Sends a request to the wallet, asking for permission to access the user's accounts. After the user accepts the request, it will return a list of accounts (addresses).
*
* This API can be useful for dapps that need to access the user's accounts in order to execute transactions or interact with smart contracts.
*
* @param client - Client to use
* @returns List of accounts managed by a wallet {@link RequestAddressesReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { requestAddresses } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const accounts = await requestAddresses(client)
*/
async function requestAddresses(client) {
	return (await client.request({ method: "eth_requestAccounts" }, {
		dedupe: true,
		retryCount: 0
	})).map((address) => getAddress(address));
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/requestPermissions.js
/**
* Requests permissions for a wallet.
*
* - Docs: https://viem.sh/docs/actions/wallet/requestPermissions
* - JSON-RPC Methods: [`wallet_requestPermissions`](https://eips.ethereum.org/EIPS/eip-2255)
*
* @param client - Client to use
* @param parameters - {@link RequestPermissionsParameters}
* @returns The wallet permissions. {@link RequestPermissionsReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { requestPermissions } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const permissions = await requestPermissions(client, {
*   eth_accounts: {}
* })
*/
async function requestPermissions(client, permissions) {
	return client.request({
		method: "wallet_requestPermissions",
		params: [permissions]
	}, { retryCount: 0 });
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/sendCallsSync.js
/**
* Requests the connected wallet to send a batch of calls, and waits for the calls to be included in a block.
*
* - Docs: https://viem.sh/docs/actions/wallet/sendCallsSync
* - JSON-RPC Methods: [`wallet_sendCalls`](https://eips.ethereum.org/EIPS/eip-5792)
*
* @param client - Client to use
* @returns Calls status. {@link SendCallsSyncReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { sendCalls } from 'viem/actions'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const status = await sendCallsSync(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   calls: [
*     {
*       data: '0xdeadbeef',
*       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*     },
*     {
*       to: '0x70997970c51812dc3a010c7d01b50e0d17dc79c8',
*       value: 69420n,
*     },
*   ],
* })
*/
async function sendCallsSync(client, parameters) {
	const { chain = client.chain } = parameters;
	const timeout = parameters.timeout ?? Math.max((chain?.blockTime ?? 0) * 3, 5e3);
	const result = await getAction(client, sendCalls, "sendCalls")(parameters);
	return await getAction(client, waitForCallsStatus, "waitForCallsStatus")({
		...parameters,
		id: result.id,
		timeout
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/showCallsStatus.js
/**
* Requests for the wallet to show information about a call batch
* that was sent via `sendCalls`.
*
* - Docs: https://viem.sh/docs/actions/wallet/showCallsStatus
* - JSON-RPC Methods: [`wallet_showCallsStatus`](https://eips.ethereum.org/EIPS/eip-5792)
*
* @param client - Client to use
* @returns Status of the calls. {@link ShowCallsStatusReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { showCallsStatus } from 'viem/actions'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* await showCallsStatus(client, { id: '0xdeadbeef' })
*/
async function showCallsStatus(client, parameters) {
	const { id } = parameters;
	await client.request({
		method: "wallet_showCallsStatus",
		params: [id]
	});
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/signAuthorization.js
/**
* Signs an [EIP-7702 Authorization](https://eips.ethereum.org/EIPS/eip-7702) object.
*
* With the calculated signature, you can:
* - use [`verifyAuthorization`](https://viem.sh/docs/eip7702/verifyAuthorization) to verify the signed Authorization object,
* - use [`recoverAuthorizationAddress`](https://viem.sh/docs/eip7702/recoverAuthorizationAddress) to recover the signing address from the signed Authorization object.
*
* @param client - Client to use
* @param parameters - {@link SignAuthorizationParameters}
* @returns The signed Authorization object. {@link SignAuthorizationReturnType}
*
* @example
* import { createClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { signAuthorization } from 'viem/experimental'
*
* const client = createClient({
*   chain: mainnet,
*   transport: http(),
* })
* const signature = await signAuthorization(client, {
*   account: privateKeyToAccount('0x..'),
*   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
* })
*
* @example
* // Account Hoisting
* import { createClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { signAuthorization } from 'viem/experimental'
*
* const client = createClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: http(),
* })
* const signature = await signAuthorization(client, {
*   contractAddress: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
* })
*/
async function signAuthorization(client, parameters) {
	const { account: account_ = client.account } = parameters;
	if (!account_) throw new AccountNotFoundError({ docsPath: "/docs/eip7702/signAuthorization" });
	const account = parseAccount(account_);
	if (!account.signAuthorization) throw new AccountTypeNotSupportedError({
		docsPath: "/docs/eip7702/signAuthorization",
		metaMessages: ["The `signAuthorization` Action does not support JSON-RPC Accounts."],
		type: account.type
	});
	const authorization = await prepareAuthorization(client, parameters);
	return account.signAuthorization(authorization);
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/signMessage.js
/**
* Calculates an Ethereum-specific signature in [EIP-191 format](https://eips.ethereum.org/EIPS/eip-191): `keccak256("\x19Ethereum Signed Message:\n" + len(message) + message))`.
*
* - Docs: https://viem.sh/docs/actions/wallet/signMessage
* - JSON-RPC Methods:
*   - JSON-RPC Accounts: [`personal_sign`](https://docs.metamask.io/guide/signing-data#personal-sign)
*   - Local Accounts: Signs locally. No JSON-RPC request.
*
* With the calculated signature, you can:
* - use [`verifyMessage`](https://viem.sh/docs/utilities/verifyMessage) to verify the signature,
* - use [`recoverMessageAddress`](https://viem.sh/docs/utilities/recoverMessageAddress) to recover the signing address from a signature.
*
* @param client - Client to use
* @param parameters - {@link SignMessageParameters}
* @returns The signed message. {@link SignMessageReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { signMessage } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const signature = await signMessage(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   message: 'hello world',
* })
*
* @example
* // Account Hoisting
* import { createWalletClient, custom } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { signMessage } from 'viem/wallet'
*
* const client = createWalletClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const signature = await signMessage(client, {
*   message: 'hello world',
* })
*/
async function signMessage(client, { account: account_ = client.account, message }) {
	if (!account_) throw new AccountNotFoundError({ docsPath: "/docs/actions/wallet/signMessage" });
	const account = parseAccount(account_);
	if (account.signMessage) return account.signMessage({ message });
	const message_ = (() => {
		if (typeof message === "string") return stringToHex(message);
		if (message.raw instanceof Uint8Array) return toHex(message.raw);
		return message.raw;
	})();
	return client.request({
		method: "personal_sign",
		params: [message_, account.address]
	}, { retryCount: 0 });
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/signTransaction.js
/**
* Signs a transaction.
*
* - Docs: https://viem.sh/docs/actions/wallet/signTransaction
* - JSON-RPC Methods:
*   - JSON-RPC Accounts: [`eth_signTransaction`](https://ethereum.github.io/execution-apis/api-documentation/)
*   - Local Accounts: Signs locally. No JSON-RPC request.
*
* @param args - {@link SignTransactionParameters}
* @returns The signed serialized transaction. {@link SignTransactionReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { signTransaction } from 'viem/actions'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const signature = await signTransaction(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   to: '0x0000000000000000000000000000000000000000',
*   value: 1n,
* })
*
* @example
* // Account Hoisting
* import { createWalletClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { signTransaction } from 'viem/actions'
*
* const client = createWalletClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const signature = await signTransaction(client, {
*   to: '0x0000000000000000000000000000000000000000',
*   value: 1n,
* })
*/
async function signTransaction(client, parameters) {
	const { account: account_ = client.account, chain = client.chain, ...transaction } = parameters;
	if (!account_) throw new AccountNotFoundError({ docsPath: "/docs/actions/wallet/signTransaction" });
	const account = parseAccount(account_);
	assertRequest({
		account,
		...parameters
	});
	const chainId = await getAction(client, getChainId, "getChainId")({});
	if (chain !== null) assertCurrentChain({
		currentChainId: chainId,
		chain
	});
	const format = (chain?.formatters || client.chain?.formatters)?.transactionRequest?.format || formatTransactionRequest;
	if (account.signTransaction) return account.signTransaction({
		...transaction,
		account,
		chainId
	}, { serializer: client.chain?.serializers?.transaction });
	return await client.request({
		method: "eth_signTransaction",
		params: [{
			...format({
				...transaction,
				account
			}, "signTransaction"),
			chainId: numberToHex(chainId),
			from: account.address
		}]
	}, { retryCount: 0 });
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/signTypedData.js
/**
* Signs typed data and calculates an Ethereum-specific signature in [https://eips.ethereum.org/EIPS/eip-712](https://eips.ethereum.org/EIPS/eip-712): `sign(keccak256("\x19\x01" ‖ domainSeparator ‖ hashStruct(message)))`
*
* - Docs: https://viem.sh/docs/actions/wallet/signTypedData
* - JSON-RPC Methods:
*   - JSON-RPC Accounts: [`eth_signTypedData_v4`](https://docs.metamask.io/guide/signing-data#signtypeddata-v4)
*   - Local Accounts: Signs locally. No JSON-RPC request.
*
* @param client - Client to use
* @param parameters - {@link SignTypedDataParameters}
* @returns The signed data. {@link SignTypedDataReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { signTypedData } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const signature = await signTypedData(client, {
*   account: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e',
*   domain: {
*     name: 'Ether Mail',
*     version: '1',
*     chainId: 1,
*     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
*   },
*   types: {
*     Person: [
*       { name: 'name', type: 'string' },
*       { name: 'wallet', type: 'address' },
*     ],
*     Mail: [
*       { name: 'from', type: 'Person' },
*       { name: 'to', type: 'Person' },
*       { name: 'contents', type: 'string' },
*     ],
*   },
*   primaryType: 'Mail',
*   message: {
*     from: {
*       name: 'Cow',
*       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
*     },
*     to: {
*       name: 'Bob',
*       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
*     },
*     contents: 'Hello, Bob!',
*   },
* })
*
* @example
* // Account Hoisting
* import { createWalletClient, http } from 'viem'
* import { privateKeyToAccount } from 'viem/accounts'
* import { mainnet } from 'viem/chains'
* import { signTypedData } from 'viem/wallet'
*
* const client = createWalletClient({
*   account: privateKeyToAccount('0x…'),
*   chain: mainnet,
*   transport: http(),
* })
* const signature = await signTypedData(client, {
*   domain: {
*     name: 'Ether Mail',
*     version: '1',
*     chainId: 1,
*     verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
*   },
*   types: {
*     Person: [
*       { name: 'name', type: 'string' },
*       { name: 'wallet', type: 'address' },
*     ],
*     Mail: [
*       { name: 'from', type: 'Person' },
*       { name: 'to', type: 'Person' },
*       { name: 'contents', type: 'string' },
*     ],
*   },
*   primaryType: 'Mail',
*   message: {
*     from: {
*       name: 'Cow',
*       wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
*     },
*     to: {
*       name: 'Bob',
*       wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
*     },
*     contents: 'Hello, Bob!',
*   },
* })
*/
async function signTypedData(client, parameters) {
	const { account: account_ = client.account, domain, message, primaryType } = parameters;
	if (!account_) throw new AccountNotFoundError({ docsPath: "/docs/actions/wallet/signTypedData" });
	const account = parseAccount(account_);
	const types = {
		EIP712Domain: getTypesForEIP712Domain({ domain }),
		...parameters.types
	};
	validateTypedData({
		domain,
		message,
		primaryType,
		types
	});
	if (account.signTypedData) return account.signTypedData({
		domain,
		message,
		primaryType,
		types
	});
	const typedData = serializeTypedData({
		domain,
		message,
		primaryType,
		types
	});
	return client.request({
		method: "eth_signTypedData_v4",
		params: [account.address, typedData]
	}, { retryCount: 0 });
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/switchChain.js
/**
* Switch the target chain in a wallet.
*
* - Docs: https://viem.sh/docs/actions/wallet/switchChain
* - JSON-RPC Methods: [`wallet_switchEthereumChain`](https://eips.ethereum.org/EIPS/eip-3326)
*
* @param client - Client to use
* @param parameters - {@link SwitchChainParameters}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet, optimism } from 'viem/chains'
* import { switchChain } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* await switchChain(client, { id: optimism.id })
*/
async function switchChain(client, { id }) {
	await client.request({
		method: "wallet_switchEthereumChain",
		params: [{ chainId: numberToHex(id) }]
	}, { retryCount: 0 });
}
//#endregion
//#region node_modules/viem/_esm/actions/wallet/watchAsset.js
/**
* Adds an EVM chain to the wallet.
*
* - Docs: https://viem.sh/docs/actions/wallet/watchAsset
* - JSON-RPC Methods: [`eth_switchEthereumChain`](https://eips.ethereum.org/EIPS/eip-747)
*
* @param client - Client to use
* @param parameters - {@link WatchAssetParameters}
* @returns Boolean indicating if the token was successfully added. {@link WatchAssetReturnType}
*
* @example
* import { createWalletClient, custom } from 'viem'
* import { mainnet } from 'viem/chains'
* import { watchAsset } from 'viem/wallet'
*
* const client = createWalletClient({
*   chain: mainnet,
*   transport: custom(window.ethereum),
* })
* const success = await watchAsset(client, {
*   type: 'ERC20',
*   options: {
*     address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
*     decimals: 18,
*     symbol: 'WETH',
*   },
* })
*/
async function watchAsset(client, params) {
	return await client.request({
		method: "wallet_watchAsset",
		params
	}, { retryCount: 0 });
}
//#endregion
//#region node_modules/viem/_esm/clients/decorators/wallet.js
function walletActions(client) {
	return {
		addChain: (args) => addChain(client, args),
		deployContract: (args) => deployContract(client, args),
		fillTransaction: (args) => fillTransaction(client, args),
		getAddresses: () => getAddresses(client),
		getCallsStatus: (args) => getCallsStatus(client, args),
		getCapabilities: (args) => getCapabilities(client, args),
		getChainId: () => getChainId(client),
		getPermissions: () => getPermissions(client),
		prepareAuthorization: (args) => prepareAuthorization(client, args),
		prepareTransactionRequest: (args) => prepareTransactionRequest(client, args),
		requestAddresses: () => requestAddresses(client),
		requestPermissions: (args) => requestPermissions(client, args),
		sendCalls: (args) => sendCalls(client, args),
		sendCallsSync: (args) => sendCallsSync(client, args),
		sendRawTransaction: (args) => sendRawTransaction(client, args),
		sendRawTransactionSync: (args) => sendRawTransactionSync(client, args),
		sendTransaction: (args) => sendTransaction(client, args),
		sendTransactionSync: (args) => sendTransactionSync(client, args),
		showCallsStatus: (args) => showCallsStatus(client, args),
		signAuthorization: (args) => signAuthorization(client, args),
		signMessage: (args) => signMessage(client, args),
		signTransaction: (args) => signTransaction(client, args),
		signTypedData: (args) => signTypedData(client, args),
		switchChain: (args) => switchChain(client, args),
		waitForCallsStatus: (args) => waitForCallsStatus(client, args),
		watchAsset: (args) => watchAsset(client, args),
		writeContract: (args) => writeContract(client, args),
		writeContractSync: (args) => writeContractSync(client, args),
		token: {
			approve: bindActionDecorators(client, approve),
			approveSync: bindActionDecorators(client, approveSync),
			transfer: bindActionDecorators(client, transfer),
			transferSync: bindActionDecorators(client, transferSync)
		}
	};
}
//#endregion
//#region node_modules/viem/_esm/clients/createWalletClient.js
function createWalletClient(parameters) {
	const { key = "wallet", name = "Wallet Client", transport } = parameters;
	return createClient({
		...parameters,
		key,
		name,
		transport,
		type: "walletClient"
	}).extend(walletActions);
}
//#endregion
//#region node_modules/viem/_esm/clients/transports/createTransport.js
/**
* @description Creates an transport intended to be used with a client.
*/
function createTransport({ key, methods, name, request, retryCount = 3, retryDelay = 150, timeout, type }, value) {
	const uid$1 = uid();
	return {
		config: {
			key,
			methods,
			name,
			request,
			retryCount,
			retryDelay,
			timeout,
			type
		},
		request: buildRequest(request, {
			methods,
			retryCount,
			retryDelay,
			uid: uid$1
		}),
		value
	};
}
//#endregion
//#region node_modules/viem/_esm/clients/transports/custom.js
/**
* @description Creates a custom transport given an EIP-1193 compliant `request` attribute.
*/
function custom(provider, config = {}) {
	const { key = "custom", methods, name = "Custom Provider", retryDelay } = config;
	return ({ retryCount: defaultRetryCount }) => createTransport({
		key,
		methods,
		name,
		request: provider.request.bind(provider),
		retryCount: config.retryCount ?? defaultRetryCount,
		retryDelay,
		type: "custom"
	});
}
//#endregion
//#region node_modules/viem/_esm/errors/transport.js
var UrlRequiredError = class extends BaseError {
	constructor() {
		super("No URL was provided to the Transport. Please provide a valid RPC URL to the Transport.", {
			docsPath: "/docs/clients/intro",
			name: "UrlRequiredError"
		});
	}
};
//#endregion
//#region node_modules/viem/_esm/clients/transports/http.js
var signalId = 0;
var signalIds = /* @__PURE__ */ new WeakMap();
function getSignalId(signal) {
	if (!signal) return "default";
	const id = signalIds.get(signal);
	if (id !== void 0) return id;
	const nextId = signalId++;
	signalIds.set(signal, nextId);
	return nextId;
}
/**
* @description Creates a HTTP transport that connects to a JSON-RPC API.
*/
function http(url, config = {}) {
	const { batch, fetchFn, fetchOptions, key = "http", maxResponseBodySize, methods, name = "HTTP JSON-RPC", onFetchRequest, onFetchResponse, retryDelay, raw } = config;
	return ({ chain, retryCount: retryCount_, timeout: timeout_ }) => {
		const { batchSize = 1e3, wait = 0 } = typeof batch === "object" ? batch : {};
		const retryCount = config.retryCount ?? retryCount_;
		const timeout = timeout_ ?? config.timeout ?? 1e4;
		const url_ = url || chain?.rpcUrls.default.http[0];
		if (!url_) throw new UrlRequiredError();
		const rpcClient = getHttpRpcClient(url_, {
			fetchFn,
			fetchOptions,
			maxResponseBodySize,
			onRequest: onFetchRequest,
			onResponse: onFetchResponse,
			timeout
		});
		return createTransport({
			key,
			methods,
			name,
			async request({ method, params }, options) {
				const body = {
					method,
					params
				};
				const fetchOptions = options?.signal ? { signal: options.signal } : void 0;
				const { schedule } = createBatchScheduler({
					id: `${url_}.${getSignalId(options?.signal)}`,
					wait,
					shouldSplitBatch(requests) {
						return requests.length > batchSize;
					},
					fn: (body) => rpcClient.request({
						body,
						fetchOptions
					}),
					sort: (a, b) => a.id - b.id
				});
				const fn = async (body) => batch ? schedule(body) : [await rpcClient.request({
					body,
					fetchOptions
				})];
				const [{ error, result }] = await fn(body);
				if (raw) return {
					error,
					result
				};
				if (error) throw new RpcRequestError({
					body,
					error,
					url: url_
				});
				return result;
			},
			retryCount,
			retryDelay,
			timeout,
			type: "http"
		}, {
			fetchOptions,
			url: url_
		});
	};
}
//#endregion
export { parseEther as a, formatEther as c, createPublicClient as i, isAddress as l, custom as n, defineChain as o, createWalletClient as r, formatGwei as s, http as t };
