import { a as formatAbiParameters, i as formatAbiItem, n as parseAbiItem, t as parseAbiParameters } from "./abitype.mjs";
import { t as keccak_256 } from "./noble__hashes.mjs";
//#region node_modules/ox/_esm/core/version.js
/** @internal */
var version = "0.1.1";
//#endregion
//#region node_modules/ox/_esm/core/internal/errors.js
/** @internal */
function getVersion() {
	return version;
}
//#endregion
//#region node_modules/ox/_esm/core/Errors.js
/**
* Base error class inherited by all errors thrown by ox.
*
* @example
* ```ts
* import { Errors } from 'ox'
* throw new Errors.BaseError('An error occurred')
* ```
*/
var BaseError = class BaseError extends Error {
	static setStaticOptions(options) {
		BaseError.prototype.docsOrigin = options.docsOrigin;
		BaseError.prototype.showVersion = options.showVersion;
		BaseError.prototype.version = options.version;
	}
	constructor(shortMessage, options = {}) {
		const details = (() => {
			if (options.cause instanceof BaseError) {
				if (options.cause.details) return options.cause.details;
				if (options.cause.shortMessage) return options.cause.shortMessage;
			}
			if (options.cause && "details" in options.cause && typeof options.cause.details === "string") return options.cause.details;
			if (options.cause?.message) return options.cause.message;
			return options.details;
		})();
		const docsPath = (() => {
			if (options.cause instanceof BaseError) return options.cause.docsPath || options.docsPath;
			return options.docsPath;
		})();
		const docsBaseUrl = options.docsOrigin ?? BaseError.prototype.docsOrigin;
		const docs = `${docsBaseUrl}${docsPath ?? ""}`;
		const showVersion = Boolean(options.version ?? BaseError.prototype.showVersion);
		const version = options.version ?? BaseError.prototype.version;
		const message = [
			shortMessage || "An error occurred.",
			...options.metaMessages ? ["", ...options.metaMessages] : [],
			...details || docsPath || showVersion ? [
				"",
				details ? `Details: ${details}` : void 0,
				docsPath ? `See: ${docs}` : void 0,
				showVersion ? `Version: ${version}` : void 0
			] : []
		].filter((x) => typeof x === "string").join("\n");
		super(message, options.cause ? { cause: options.cause } : void 0);
		Object.defineProperty(this, "details", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "docs", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "docsOrigin", {
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
		Object.defineProperty(this, "shortMessage", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: void 0
		});
		Object.defineProperty(this, "showVersion", {
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
		Object.defineProperty(this, "cause", {
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
		this.cause = options.cause;
		this.details = details;
		this.docs = docs;
		this.docsOrigin = docsBaseUrl;
		this.docsPath = docsPath;
		this.shortMessage = shortMessage;
		this.showVersion = showVersion;
		this.version = version;
	}
	walk(fn) {
		return walk(this, fn);
	}
};
Object.defineProperty(BaseError, "defaultStaticOptions", {
	enumerable: true,
	configurable: true,
	writable: true,
	value: {
		docsOrigin: "https://oxlib.sh",
		showVersion: false,
		version: `ox@${getVersion()}`
	}
});
(() => {
	BaseError.setStaticOptions(BaseError.defaultStaticOptions);
})();
/** @internal */
function walk(err, fn) {
	if (fn?.(err)) return err;
	if (err && typeof err === "object" && "cause" in err && err.cause) return walk(err.cause, fn);
	return fn ? null : err;
}
//#endregion
//#region node_modules/ox/_esm/core/internal/bytes.js
/** @internal */
function assertSize$1(bytes, size_) {
	if (size$1(bytes) > size_) throw new SizeOverflowError$1({
		givenSize: size$1(bytes),
		maxSize: size_
	});
}
/** @internal */
function assertStartOffset$1(value, start) {
	if (typeof start === "number" && start > 0 && start > size$1(value) - 1) throw new SliceOffsetOutOfBoundsError$1({
		offset: start,
		position: "start",
		size: size$1(value)
	});
}
/** @internal */
function assertEndOffset$1(value, start, end) {
	if (typeof start === "number" && typeof end === "number" && size$1(value) !== end - start) throw new SliceOffsetOutOfBoundsError$1({
		offset: end,
		position: "end",
		size: size$1(value)
	});
}
/** @internal */
var charCodeMap = {
	zero: 48,
	nine: 57,
	A: 65,
	F: 70,
	a: 97,
	f: 102
};
/** @internal */
function charCodeToBase16(char) {
	if (char >= charCodeMap.zero && char <= charCodeMap.nine) return char - charCodeMap.zero;
	if (char >= charCodeMap.A && char <= charCodeMap.F) return char - (charCodeMap.A - 10);
	if (char >= charCodeMap.a && char <= charCodeMap.f) return char - (charCodeMap.a - 10);
}
/** @internal */
function pad$1(bytes, options = {}) {
	const { dir, size = 32 } = options;
	if (size === 0) return bytes;
	if (bytes.length > size) throw new SizeExceedsPaddingSizeError$1({
		size: bytes.length,
		targetSize: size,
		type: "Bytes"
	});
	const paddedBytes = new Uint8Array(size);
	for (let i = 0; i < size; i++) {
		const padEnd = dir === "right";
		paddedBytes[padEnd ? i : size - i - 1] = bytes[padEnd ? i : bytes.length - i - 1];
	}
	return paddedBytes;
}
/** @internal */
function trim(value, options = {}) {
	const { dir = "left" } = options;
	let data = value;
	let sliceLength = 0;
	for (let i = 0; i < data.length - 1; i++) if (data[dir === "left" ? i : data.length - i - 1].toString() === "0") sliceLength++;
	else break;
	data = dir === "left" ? data.slice(sliceLength) : data.slice(0, data.length - sliceLength);
	return data;
}
//#endregion
//#region node_modules/ox/_esm/core/internal/hex.js
/** @internal */
function assertSize(hex, size_) {
	if (size(hex) > size_) throw new SizeOverflowError({
		givenSize: size(hex),
		maxSize: size_
	});
}
/** @internal */
function assertStartOffset(value, start) {
	if (typeof start === "number" && start > 0 && start > size(value) - 1) throw new SliceOffsetOutOfBoundsError({
		offset: start,
		position: "start",
		size: size(value)
	});
}
/** @internal */
function assertEndOffset(value, start, end) {
	if (typeof start === "number" && typeof end === "number" && size(value) !== end - start) throw new SliceOffsetOutOfBoundsError({
		offset: end,
		position: "end",
		size: size(value)
	});
}
/** @internal */
function pad(hex_, options = {}) {
	const { dir, size = 32 } = options;
	if (size === 0) return hex_;
	const hex = hex_.replace("0x", "");
	if (hex.length > size * 2) throw new SizeExceedsPaddingSizeError({
		size: Math.ceil(hex.length / 2),
		targetSize: size,
		type: "Hex"
	});
	return `0x${hex[dir === "right" ? "padEnd" : "padStart"](size * 2, "0")}`;
}
//#endregion
//#region node_modules/ox/_esm/core/Json.js
var bigIntSuffix = "#__bigint";
/**
* Stringifies a value to its JSON representation, with support for `bigint`.
*
* @example
* ```ts twoslash
* import { Json } from 'ox'
*
* const json = Json.stringify({
*   foo: 'bar',
*   baz: 69420694206942069420694206942069420694206942069420n,
* })
* // @log: '{"foo":"bar","baz":"69420694206942069420694206942069420694206942069420#__bigint"}'
* ```
*
* @param value - The value to stringify.
* @param replacer - A function that transforms the results. It is passed the key and value of the property, and must return the value to be used in the JSON string. If this function returns `undefined`, the property is not included in the resulting JSON string.
* @param space - A string or number that determines the indentation of the JSON string. If it is a number, it indicates the number of spaces to use as indentation; if it is a string (e.g. `'\t'`), it uses the string as the indentation character.
* @returns The JSON string.
*/
function stringify(value, replacer, space) {
	return JSON.stringify(value, (key, value) => {
		if (typeof replacer === "function") return replacer(key, value);
		if (typeof value === "bigint") return value.toString() + bigIntSuffix;
		return value;
	}, space);
}
//#endregion
//#region node_modules/ox/_esm/core/Bytes.js
var decoder = /*#__PURE__*/ new TextDecoder();
var encoder$1 = /*#__PURE__*/ new TextEncoder();
/**
* Instantiates a {@link ox#Bytes.Bytes} value from a `Uint8Array`, a hex string, or an array of unsigned 8-bit integers.
*
* :::tip
*
* To instantiate from a **Boolean**, **String**, or **Number**, use one of the following:
*
* - `Bytes.fromBoolean`
*
* - `Bytes.fromString`
*
* - `Bytes.fromNumber`
*
* :::
*
* @example
* ```ts twoslash
* // @noErrors
* import { Bytes } from 'ox'
*
* const data = Bytes.from([255, 124, 5, 4])
* // @log: Uint8Array([255, 124, 5, 4])
*
* const data = Bytes.from('0xdeadbeef')
* // @log: Uint8Array([222, 173, 190, 239])
* ```
*
* @param value - Value to convert.
* @returns A {@link ox#Bytes.Bytes} instance.
*/
function from$8(value) {
	if (value instanceof Uint8Array) return value;
	if (typeof value === "string") return fromHex$1(value);
	return fromArray(value);
}
/**
* Converts an array of unsigned 8-bit integers into {@link ox#Bytes.Bytes}.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* const data = Bytes.fromArray([255, 124, 5, 4])
* // @log: Uint8Array([255, 124, 5, 4])
* ```
*
* @param value - Value to convert.
* @returns A {@link ox#Bytes.Bytes} instance.
*/
function fromArray(value) {
	return value instanceof Uint8Array ? value : new Uint8Array(value);
}
/**
* Encodes a {@link ox#Hex.Hex} value into {@link ox#Bytes.Bytes}.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* const data = Bytes.fromHex('0x48656c6c6f20776f726c6421')
* // @log: Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
* ```
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* const data = Bytes.fromHex('0x48656c6c6f20776f726c6421', { size: 32 })
* // @log: Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
* ```
*
* @param value - {@link ox#Hex.Hex} value to encode.
* @param options - Encoding options.
* @returns Encoded {@link ox#Bytes.Bytes}.
*/
function fromHex$1(value, options = {}) {
	const { size } = options;
	let hex = value;
	if (size) {
		assertSize(value, size);
		hex = padRight(value, size);
	}
	let hexString = hex.slice(2);
	if (hexString.length % 2) hexString = `0${hexString}`;
	const length = hexString.length / 2;
	const bytes = new Uint8Array(length);
	for (let index = 0, j = 0; index < length; index++) {
		const nibbleLeft = charCodeToBase16(hexString.charCodeAt(j++));
		const nibbleRight = charCodeToBase16(hexString.charCodeAt(j++));
		if (nibbleLeft === void 0 || nibbleRight === void 0) throw new BaseError(`Invalid byte sequence ("${hexString[j - 2]}${hexString[j - 1]}" in "${hexString}").`);
		bytes[index] = nibbleLeft << 4 | nibbleRight;
	}
	return bytes;
}
/**
* Encodes a string into {@link ox#Bytes.Bytes}.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* const data = Bytes.fromString('Hello world!')
* // @log: Uint8Array([72, 101, 108, 108, 111, 32, 119, 111, 114, 108, 100, 33])
* ```
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* const data = Bytes.fromString('Hello world!', { size: 32 })
* // @log: Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
* ```
*
* @param value - String to encode.
* @param options - Encoding options.
* @returns Encoded {@link ox#Bytes.Bytes}.
*/
function fromString$1(value, options = {}) {
	const { size } = options;
	const bytes = encoder$1.encode(value);
	if (typeof size === "number") {
		assertSize$1(bytes, size);
		return padRight$1(bytes, size);
	}
	return bytes;
}
/**
* Pads a {@link ox#Bytes.Bytes} value to the right with zero bytes until it reaches the given `size` (default: 32 bytes).
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.padRight(Bytes.from([1]), 4)
* // @log: Uint8Array([1, 0, 0, 0])
* ```
*
* @param value - {@link ox#Bytes.Bytes} value to pad.
* @param size - Size to pad the {@link ox#Bytes.Bytes} value to.
* @returns Padded {@link ox#Bytes.Bytes} value.
*/
function padRight$1(value, size) {
	return pad$1(value, {
		dir: "right",
		size
	});
}
/**
* Retrieves the size of a {@link ox#Bytes.Bytes} value.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.size(Bytes.from([1, 2, 3, 4]))
* // @log: 4
* ```
*
* @param value - {@link ox#Bytes.Bytes} value.
* @returns Size of the {@link ox#Bytes.Bytes} value.
*/
function size$1(value) {
	return value.length;
}
/**
* Returns a section of a {@link ox#Bytes.Bytes} value given a start/end bytes offset.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.slice(
*   Bytes.from([1, 2, 3, 4, 5, 6, 7, 8, 9]),
*   1,
*   4,
* )
* // @log: Uint8Array([2, 3, 4])
* ```
*
* @param value - The {@link ox#Bytes.Bytes} value.
* @param start - Start offset.
* @param end - End offset.
* @param options - Slice options.
* @returns Sliced {@link ox#Bytes.Bytes} value.
*/
function slice$1(value, start, end, options = {}) {
	const { strict } = options;
	assertStartOffset$1(value, start);
	const value_ = value.slice(start, end);
	if (strict) assertEndOffset$1(value_, start, end);
	return value_;
}
/**
* Decodes a {@link ox#Bytes.Bytes} into a bigint.
*
* @example
* ```ts
* import { Bytes } from 'ox'
*
* Bytes.toBigInt(Bytes.from([1, 164]))
* // @log: 420n
* ```
*
* @param bytes - The {@link ox#Bytes.Bytes} to decode.
* @param options - Decoding options.
* @returns Decoded bigint.
*/
function toBigInt$1(bytes, options = {}) {
	const { size } = options;
	if (typeof size !== "undefined") assertSize$1(bytes, size);
	return toBigInt(fromBytes$1(bytes, options), options);
}
/**
* Decodes a {@link ox#Bytes.Bytes} into a boolean.
*
* @example
* ```ts
* import { Bytes } from 'ox'
*
* Bytes.toBoolean(Bytes.from([1]))
* // @log: true
* ```
*
* @param bytes - The {@link ox#Bytes.Bytes} to decode.
* @param options - Decoding options.
* @returns Decoded boolean.
*/
function toBoolean(bytes, options = {}) {
	const { size } = options;
	let bytes_ = bytes;
	if (typeof size !== "undefined") {
		assertSize$1(bytes_, size);
		bytes_ = trimLeft(bytes_);
	}
	if (bytes_.length > 1 || bytes_[0] > 1) throw new InvalidBytesBooleanError(bytes_);
	return Boolean(bytes_[0]);
}
/**
* Decodes a {@link ox#Bytes.Bytes} into a number.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.toNumber(Bytes.from([1, 164]))
* // @log: 420
* ```
*/
function toNumber$1(bytes, options = {}) {
	const { size } = options;
	if (typeof size !== "undefined") assertSize$1(bytes, size);
	return toNumber(fromBytes$1(bytes, options), options);
}
/**
* Decodes a {@link ox#Bytes.Bytes} into a string.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* const data = Bytes.toString(Bytes.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]))
* // @log: 'Hello world'
* ```
*
* @param bytes - The {@link ox#Bytes.Bytes} to decode.
* @param options - Options.
* @returns Decoded string.
*/
function toString(bytes, options = {}) {
	const { size } = options;
	let bytes_ = bytes;
	if (typeof size !== "undefined") {
		assertSize$1(bytes_, size);
		bytes_ = trimRight(bytes_);
	}
	return decoder.decode(bytes_);
}
/**
* Trims leading zeros from a {@link ox#Bytes.Bytes} value.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.trimLeft(Bytes.from([0, 0, 0, 0, 1, 2, 3]))
* // @log: Uint8Array([1, 2, 3])
* ```
*
* @param value - {@link ox#Bytes.Bytes} value.
* @returns Trimmed {@link ox#Bytes.Bytes} value.
*/
function trimLeft(value) {
	return trim(value, { dir: "left" });
}
/**
* Trims trailing zeros from a {@link ox#Bytes.Bytes} value.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.trimRight(Bytes.from([1, 2, 3, 0, 0, 0, 0]))
* // @log: Uint8Array([1, 2, 3])
* ```
*
* @param value - {@link ox#Bytes.Bytes} value.
* @returns Trimmed {@link ox#Bytes.Bytes} value.
*/
function trimRight(value) {
	return trim(value, { dir: "right" });
}
/**
* Thrown when the bytes value cannot be represented as a boolean.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.toBoolean(Bytes.from([5]))
* // @error: Bytes.InvalidBytesBooleanError: Bytes value `[5]` is not a valid boolean.
* // @error: The bytes array must contain a single byte of either a `0` or `1` value.
* ```
*/
var InvalidBytesBooleanError = class extends BaseError {
	constructor(bytes) {
		super(`Bytes value \`${bytes}\` is not a valid boolean.`, { metaMessages: ["The bytes array must contain a single byte of either a `0` or `1` value."] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Bytes.InvalidBytesBooleanError"
		});
	}
};
/**
* Thrown when a size exceeds the maximum allowed size.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.fromString('Hello World!', { size: 8 })
* // @error: Bytes.SizeOverflowError: Size cannot exceed `8` bytes. Given size: `12` bytes.
* ```
*/
var SizeOverflowError$1 = class extends BaseError {
	constructor({ givenSize, maxSize }) {
		super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Bytes.SizeOverflowError"
		});
	}
};
/**
* Thrown when a slice offset is out-of-bounds.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.slice(Bytes.from([1, 2, 3]), 4)
* // @error: Bytes.SliceOffsetOutOfBoundsError: Slice starting at offset `4` is out-of-bounds (size: `3`).
* ```
*/
var SliceOffsetOutOfBoundsError$1 = class extends BaseError {
	constructor({ offset, position, size }) {
		super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size}\`).`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Bytes.SliceOffsetOutOfBoundsError"
		});
	}
};
/**
* Thrown when a the padding size exceeds the maximum allowed size.
*
* @example
* ```ts twoslash
* import { Bytes } from 'ox'
*
* Bytes.padLeft(Bytes.fromString('Hello World!'), 8)
* // @error: [Bytes.SizeExceedsPaddingSizeError: Bytes size (`12`) exceeds padding size (`8`).
* ```
*/
var SizeExceedsPaddingSizeError$1 = class extends BaseError {
	constructor({ size, targetSize, type }) {
		super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size}\`) exceeds padding size (\`${targetSize}\`).`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Bytes.SizeExceedsPaddingSizeError"
		});
	}
};
//#endregion
//#region node_modules/ox/_esm/core/Hex.js
var encoder = /*#__PURE__*/ new TextEncoder();
var hexes = /*#__PURE__*/ Array.from({ length: 256 }, (_v, i) => i.toString(16).padStart(2, "0"));
/**
* Asserts if the given value is {@link ox#Hex.Hex}.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.assert('abc')
* // @error: InvalidHexValueTypeError:
* // @error: Value `"abc"` of type `string` is an invalid hex type.
* // @error: Hex types must be represented as `"0x\${string}"`.
* ```
*
* @param value - The value to assert.
* @param options - Options.
*/
function assert$4(value, options = {}) {
	const { strict = false } = options;
	if (!value) throw new InvalidHexTypeError(value);
	if (typeof value !== "string") throw new InvalidHexTypeError(value);
	if (strict) {
		if (!/^0x[0-9a-fA-F]*$/.test(value)) throw new InvalidHexValueError(value);
	}
	if (!value.startsWith("0x")) throw new InvalidHexValueError(value);
}
/**
* Concatenates two or more {@link ox#Hex.Hex}.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.concat('0x123', '0x456')
* // @log: '0x123456'
* ```
*
* @param values - The {@link ox#Hex.Hex} values to concatenate.
* @returns The concatenated {@link ox#Hex.Hex} value.
*/
function concat(...values) {
	return `0x${values.reduce((acc, x) => acc + x.replace("0x", ""), "")}`;
}
/**
* Instantiates a {@link ox#Hex.Hex} value from a hex string or {@link ox#Bytes.Bytes} value.
*
* :::tip
*
* To instantiate from a **Boolean**, **String**, or **Number**, use one of the following:
*
* - `Hex.fromBoolean`
*
* - `Hex.fromString`
*
* - `Hex.fromNumber`
*
* :::
*
* @example
* ```ts twoslash
* import { Bytes, Hex } from 'ox'
*
* Hex.from('0x48656c6c6f20576f726c6421')
* // @log: '0x48656c6c6f20576f726c6421'
*
* Hex.from(Bytes.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]))
* // @log: '0x48656c6c6f20576f726c6421'
* ```
*
* @param value - The {@link ox#Bytes.Bytes} value to encode.
* @returns The encoded {@link ox#Hex.Hex} value.
*/
function from$7(value) {
	if (value instanceof Uint8Array) return fromBytes$1(value);
	if (Array.isArray(value)) return fromBytes$1(new Uint8Array(value));
	return value;
}
/**
* Encodes a boolean into a {@link ox#Hex.Hex} value.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.fromBoolean(true)
* // @log: '0x1'
*
* Hex.fromBoolean(false)
* // @log: '0x0'
*
* Hex.fromBoolean(true, { size: 32 })
* // @log: '0x0000000000000000000000000000000000000000000000000000000000000001'
* ```
*
* @param value - The boolean value to encode.
* @param options - Options.
* @returns The encoded {@link ox#Hex.Hex} value.
*/
function fromBoolean(value, options = {}) {
	const hex = `0x${Number(value)}`;
	if (typeof options.size === "number") {
		assertSize(hex, options.size);
		return padLeft(hex, options.size);
	}
	return hex;
}
/**
* Encodes a {@link ox#Bytes.Bytes} value into a {@link ox#Hex.Hex} value.
*
* @example
* ```ts twoslash
* import { Bytes, Hex } from 'ox'
*
* Hex.fromBytes(Bytes.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33]))
* // @log: '0x48656c6c6f20576f726c6421'
* ```
*
* @param value - The {@link ox#Bytes.Bytes} value to encode.
* @param options - Options.
* @returns The encoded {@link ox#Hex.Hex} value.
*/
function fromBytes$1(value, options = {}) {
	let string = "";
	for (let i = 0; i < value.length; i++) string += hexes[value[i]];
	const hex = `0x${string}`;
	if (typeof options.size === "number") {
		assertSize(hex, options.size);
		return padRight(hex, options.size);
	}
	return hex;
}
/**
* Encodes a number or bigint into a {@link ox#Hex.Hex} value.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.fromNumber(420)
* // @log: '0x1a4'
*
* Hex.fromNumber(420, { size: 32 })
* // @log: '0x00000000000000000000000000000000000000000000000000000000000001a4'
* ```
*
* @param value - The number or bigint value to encode.
* @param options - Options.
* @returns The encoded {@link ox#Hex.Hex} value.
*/
function fromNumber(value, options = {}) {
	const { signed, size } = options;
	const value_ = BigInt(value);
	let maxValue;
	if (size) {
		if (signed) maxValue = (1n << BigInt(size) * 8n - 1n) - 1n;
		else maxValue = 2n ** (BigInt(size) * 8n) - 1n;
	} else if (typeof value === "number") maxValue = BigInt(Number.MAX_SAFE_INTEGER);
	const minValue = typeof maxValue === "bigint" && signed ? -maxValue - 1n : 0;
	if (maxValue && value_ > maxValue || value_ < minValue) {
		const suffix = typeof value === "bigint" ? "n" : "";
		throw new IntegerOutOfRangeError({
			max: maxValue ? `${maxValue}${suffix}` : void 0,
			min: `${minValue}${suffix}`,
			signed,
			size,
			value: `${value}${suffix}`
		});
	}
	const hex = `0x${(signed && value_ < 0 ? BigInt.asUintN(size * 8, BigInt(value_)) : value_).toString(16)}`;
	if (size) return padLeft(hex, size);
	return hex;
}
/**
* Encodes a string into a {@link ox#Hex.Hex} value.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
* Hex.fromString('Hello World!')
* // '0x48656c6c6f20576f726c6421'
*
* Hex.fromString('Hello World!', { size: 32 })
* // '0x48656c6c6f20576f726c64210000000000000000000000000000000000000000'
* ```
*
* @param value - The string value to encode.
* @param options - Options.
* @returns The encoded {@link ox#Hex.Hex} value.
*/
function fromString(value, options = {}) {
	return fromBytes$1(encoder.encode(value), options);
}
/**
* Pads a {@link ox#Hex.Hex} value to the left with zero bytes until it reaches the given `size` (default: 32 bytes).
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.padLeft('0x1234', 4)
* // @log: '0x00001234'
* ```
*
* @param value - The {@link ox#Hex.Hex} value to pad.
* @param size - The size (in bytes) of the output hex value.
* @returns The padded {@link ox#Hex.Hex} value.
*/
function padLeft(value, size) {
	return pad(value, {
		dir: "left",
		size
	});
}
/**
* Pads a {@link ox#Hex.Hex} value to the right with zero bytes until it reaches the given `size` (default: 32 bytes).
*
* @example
* ```ts
* import { Hex } from 'ox'
*
* Hex.padRight('0x1234', 4)
* // @log: '0x12340000'
* ```
*
* @param value - The {@link ox#Hex.Hex} value to pad.
* @param size - The size (in bytes) of the output hex value.
* @returns The padded {@link ox#Hex.Hex} value.
*/
function padRight(value, size) {
	return pad(value, {
		dir: "right",
		size
	});
}
/**
* Returns a section of a {@link ox#Bytes.Bytes} value given a start/end bytes offset.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.slice('0x0123456789', 1, 4)
* // @log: '0x234567'
* ```
*
* @param value - The {@link ox#Hex.Hex} value to slice.
* @param start - The start offset (in bytes).
* @param end - The end offset (in bytes).
* @param options - Options.
* @returns The sliced {@link ox#Hex.Hex} value.
*/
function slice(value, start, end, options = {}) {
	const { strict } = options;
	assertStartOffset(value, start);
	const value_ = `0x${value.replace("0x", "").slice((start ?? 0) * 2, (end ?? value.length) * 2)}`;
	if (strict) assertEndOffset(value_, start, end);
	return value_;
}
/**
* Retrieves the size of a {@link ox#Hex.Hex} value (in bytes).
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.size('0xdeadbeef')
* // @log: 4
* ```
*
* @param value - The {@link ox#Hex.Hex} value to get the size of.
* @returns The size of the {@link ox#Hex.Hex} value (in bytes).
*/
function size(value) {
	return Math.ceil((value.length - 2) / 2);
}
/**
* Decodes a {@link ox#Hex.Hex} value into a BigInt.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.toBigInt('0x1a4')
* // @log: 420n
*
* Hex.toBigInt('0x00000000000000000000000000000000000000000000000000000000000001a4', { size: 32 })
* // @log: 420n
* ```
*
* @param hex - The {@link ox#Hex.Hex} value to decode.
* @param options - Options.
* @returns The decoded BigInt.
*/
function toBigInt(hex, options = {}) {
	const { signed } = options;
	if (options.size) assertSize(hex, options.size);
	const value = BigInt(hex);
	if (!signed) return value;
	const size = (hex.length - 2) / 2;
	const max_unsigned = (1n << BigInt(size) * 8n) - 1n;
	if (value <= max_unsigned >> 1n) return value;
	return value - max_unsigned - 1n;
}
/**
* Decodes a {@link ox#Hex.Hex} value into a number.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.toNumber('0x1a4')
* // @log: 420
*
* Hex.toNumber('0x00000000000000000000000000000000000000000000000000000000000001a4', { size: 32 })
* // @log: 420
* ```
*
* @param hex - The {@link ox#Hex.Hex} value to decode.
* @param options - Options.
* @returns The decoded number.
*/
function toNumber(hex, options = {}) {
	const { signed, size } = options;
	if (!signed && !size) return Number(hex);
	return Number(toBigInt(hex, options));
}
/**
* Checks if the given value is {@link ox#Hex.Hex}.
*
* @example
* ```ts twoslash
* import { Bytes, Hex } from 'ox'
*
* Hex.validate('0xdeadbeef')
* // @log: true
*
* Hex.validate(Bytes.from([1, 2, 3]))
* // @log: false
* ```
*
* @param value - The value to check.
* @param options - Options.
* @returns `true` if the value is a {@link ox#Hex.Hex}, `false` otherwise.
*/
function validate$3(value, options = {}) {
	const { strict = false } = options;
	try {
		assert$4(value, { strict });
		return true;
	} catch {
		return false;
	}
}
/**
* Thrown when the provided integer is out of range, and cannot be represented as a hex value.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.fromNumber(420182738912731283712937129)
* // @error: Hex.IntegerOutOfRangeError: Number \`4.2018273891273126e+26\` is not in safe unsigned integer range (`0` to `9007199254740991`)
* ```
*/
var IntegerOutOfRangeError = class extends BaseError {
	constructor({ max, min, signed, size, value }) {
		super(`Number \`${value}\` is not in safe${size ? ` ${size * 8}-bit` : ""}${signed ? " signed" : " unsigned"} integer range ${max ? `(\`${min}\` to \`${max}\`)` : `(above \`${min}\`)`}`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Hex.IntegerOutOfRangeError"
		});
	}
};
/**
* Thrown when the provided value is not a valid hex type.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.assert(1)
* // @error: Hex.InvalidHexTypeError: Value `1` of type `number` is an invalid hex type.
* ```
*/
var InvalidHexTypeError = class extends BaseError {
	constructor(value) {
		super(`Value \`${typeof value === "object" ? stringify(value) : value}\` of type \`${typeof value}\` is an invalid hex type.`, { metaMessages: ["Hex types must be represented as `\"0x${string}\"`."] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Hex.InvalidHexTypeError"
		});
	}
};
/**
* Thrown when the provided hex value is invalid.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.assert('0x0123456789abcdefg')
* // @error: Hex.InvalidHexValueError: Value `0x0123456789abcdefg` is an invalid hex value.
* // @error: Hex values must start with `"0x"` and contain only hexadecimal characters (0-9, a-f, A-F).
* ```
*/
var InvalidHexValueError = class extends BaseError {
	constructor(value) {
		super(`Value \`${value}\` is an invalid hex value.`, { metaMessages: ["Hex values must start with `\"0x\"` and contain only hexadecimal characters (0-9, a-f, A-F)."] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Hex.InvalidHexValueError"
		});
	}
};
/**
* Thrown when the size of the value exceeds the expected max size.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.fromString('Hello World!', { size: 8 })
* // @error: Hex.SizeOverflowError: Size cannot exceed `8` bytes. Given size: `12` bytes.
* ```
*/
var SizeOverflowError = class extends BaseError {
	constructor({ givenSize, maxSize }) {
		super(`Size cannot exceed \`${maxSize}\` bytes. Given size: \`${givenSize}\` bytes.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Hex.SizeOverflowError"
		});
	}
};
/**
* Thrown when the slice offset exceeds the bounds of the value.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.slice('0x0123456789', 6)
* // @error: Hex.SliceOffsetOutOfBoundsError: Slice starting at offset `6` is out-of-bounds (size: `5`).
* ```
*/
var SliceOffsetOutOfBoundsError = class extends BaseError {
	constructor({ offset, position, size }) {
		super(`Slice ${position === "start" ? "starting" : "ending"} at offset \`${offset}\` is out-of-bounds (size: \`${size}\`).`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Hex.SliceOffsetOutOfBoundsError"
		});
	}
};
/**
* Thrown when the size of the value exceeds the pad size.
*
* @example
* ```ts twoslash
* import { Hex } from 'ox'
*
* Hex.padLeft('0x1a4e12a45a21323123aaa87a897a897a898a6567a578a867a98778a667a85a875a87a6a787a65a675a6a9', 32)
* // @error: Hex.SizeExceedsPaddingSizeError: Hex size (`43`) exceeds padding size (`32`).
* ```
*/
var SizeExceedsPaddingSizeError = class extends BaseError {
	constructor({ size, targetSize, type }) {
		super(`${type.charAt(0).toUpperCase()}${type.slice(1).toLowerCase()} size (\`${size}\`) exceeds padding size (\`${targetSize}\`).`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Hex.SizeExceedsPaddingSizeError"
		});
	}
};
//#endregion
//#region node_modules/ox/_esm/core/Withdrawal.js
/**
* Converts a {@link ox#Withdrawal.Withdrawal} to an {@link ox#Withdrawal.Rpc}.
*
* @example
* ```ts twoslash
* import { Withdrawal } from 'ox'
*
* const withdrawal = Withdrawal.toRpc({
*   address: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
*   amount: 6423331n,
*   index: 0,
*   validatorIndex: 1,
* })
* // @log: {
* // @log:   address: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
* // @log:   amount: '0x620323',
* // @log:   index: '0x0',
* // @log:   validatorIndex: '0x1',
* // @log: }
* ```
*
* @param withdrawal - The Withdrawal to convert.
* @returns An RPC Withdrawal.
*/
function toRpc$1(withdrawal) {
	return {
		address: withdrawal.address,
		amount: fromNumber(withdrawal.amount),
		index: fromNumber(withdrawal.index),
		validatorIndex: fromNumber(withdrawal.validatorIndex)
	};
}
//#endregion
//#region node_modules/ox/_esm/core/BlockOverrides.js
/**
* Converts an {@link ox#BlockOverrides.BlockOverrides} to an {@link ox#BlockOverrides.Rpc}.
*
* @example
* ```ts twoslash
* import { BlockOverrides } from 'ox'
*
* const blockOverrides = BlockOverrides.toRpc({
*   baseFeePerGas: 1n,
*   blobBaseFee: 2n,
*   feeRecipient: '0x0000000000000000000000000000000000000000',
*   gasLimit: 4n,
*   number: 5n,
*   prevRandao: 6n,
*   time: 78187493520n,
*   withdrawals: [
*     {
*       address: '0x0000000000000000000000000000000000000000',
*       amount: 1n,
*       index: 0,
*       validatorIndex: 1,
*     },
*   ],
* })
* ```
*
* @param blockOverrides - The block overrides to convert.
* @returns An instantiated {@link ox#BlockOverrides.Rpc}.
*/
function toRpc(blockOverrides) {
	return {
		...typeof blockOverrides.baseFeePerGas === "bigint" && { baseFeePerGas: fromNumber(blockOverrides.baseFeePerGas) },
		...typeof blockOverrides.blobBaseFee === "bigint" && { blobBaseFee: fromNumber(blockOverrides.blobBaseFee) },
		...typeof blockOverrides.feeRecipient === "string" && { feeRecipient: blockOverrides.feeRecipient },
		...typeof blockOverrides.gasLimit === "bigint" && { gasLimit: fromNumber(blockOverrides.gasLimit) },
		...typeof blockOverrides.number === "bigint" && { number: fromNumber(blockOverrides.number) },
		...typeof blockOverrides.prevRandao === "bigint" && { prevRandao: fromNumber(blockOverrides.prevRandao) },
		...typeof blockOverrides.time === "bigint" && { time: fromNumber(blockOverrides.time) },
		...blockOverrides.withdrawals && { withdrawals: blockOverrides.withdrawals.map(toRpc$1) }
	};
}
//#endregion
//#region node_modules/ox/_esm/core/internal/lru.js
/**
* @internal
*
* Map with a LRU (Least recently used) policy.
* @see https://en.wikipedia.org/wiki/Cache_replacement_policies#LRU
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
		if (super.has(key) && value !== void 0) {
			this.delete(key);
			super.set(key, value);
		}
		return value;
	}
	set(key, value) {
		super.set(key, value);
		if (this.maxSize && this.size > this.maxSize) {
			const firstKey = this.keys().next().value;
			if (firstKey) this.delete(firstKey);
		}
		return this;
	}
};
var checksum$1 = { checksum: /*#__PURE__*/ new LruMap(8192) }.checksum;
//#endregion
//#region node_modules/ox/_esm/core/Hash.js
/**
* Calculates the [Keccak256](https://en.wikipedia.org/wiki/SHA-3) hash of a {@link ox#Bytes.Bytes} or {@link ox#Hex.Hex} value.
*
* This function is a re-export of `keccak_256` from [`@noble/hashes`](https://github.com/paulmillr/noble-hashes), an audited & minimal JS hashing library.
*
* @example
* ```ts twoslash
* import { Hash } from 'ox'
*
* Hash.keccak256('0xdeadbeef')
* // @log: '0xd4fd4e189132273036449fc9e11198c739161b4c0116a9a2dccdfa1c492006f1'
* ```
*
* @example
* ### Calculate Hash of a String
*
* ```ts twoslash
* import { Hash, Hex } from 'ox'
*
* Hash.keccak256(Hex.fromString('hello world'))
* // @log: '0x3ea2f1d0abf3fc66cf29eebb70cbd4e7fe762ef8a09bcc06c8edf641230afec0'
* ```
*
* @example
* ### Configure Return Type
*
* ```ts twoslash
* import { Hash } from 'ox'
*
* Hash.keccak256('0xdeadbeef', { as: 'Bytes' })
* // @log: Uint8Array [...]
* ```
*
* @param value - {@link ox#Bytes.Bytes} or {@link ox#Hex.Hex} value.
* @param options - Options.
* @returns Keccak256 hash.
*/
function keccak256(value, options = {}) {
	const { as = typeof value === "string" ? "Hex" : "Bytes" } = options;
	const bytes = keccak_256(from$8(value));
	if (as === "Bytes") return bytes;
	return fromBytes$1(bytes);
}
//#endregion
//#region node_modules/ox/_esm/core/Address.js
var addressRegex = /^0x[a-fA-F0-9]{40}$/;
/**
* Asserts that the given value is a valid {@link ox#Address.Address}.
*
* @example
* ```ts twoslash
* import { Address } from 'ox'
*
* Address.assert('0xA0Cf798816D4b9b9866b5330EEa46a18382f251e')
* ```
*
* @example
* ```ts twoslash
* import { Address } from 'ox'
*
* Address.assert('0xdeadbeef')
* // @error: InvalidAddressError: Address "0xdeadbeef" is invalid.
* ```
*
* @param value - Value to assert if it is a valid address.
* @param options - Assertion options.
*/
function assert$3(value, options = {}) {
	const { strict = true } = options;
	if (!addressRegex.test(value)) throw new InvalidAddressError({
		address: value,
		cause: new InvalidInputError()
	});
	if (strict) {
		if (value.toLowerCase() === value) return;
		if (checksum(value) !== value) throw new InvalidAddressError({
			address: value,
			cause: new InvalidChecksumError()
		});
	}
}
/**
* Computes the checksum address for the given {@link ox#Address.Address}.
*
* @example
* ```ts twoslash
* import { Address } from 'ox'
*
* Address.checksum('0xa0cf798816d4b9b9866b5330eea46a18382f251e')
* // @log: '0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'
* ```
*
* @param address - The address to compute the checksum for.
* @returns The checksummed address.
*/
function checksum(address) {
	if (checksum$1.has(address)) return checksum$1.get(address);
	assert$3(address, { strict: false });
	const hexAddress = address.substring(2).toLowerCase();
	const hash = keccak256(fromString$1(hexAddress), { as: "Bytes" });
	const characters = hexAddress.split("");
	for (let i = 0; i < 40; i += 2) {
		if (hash[i >> 1] >> 4 >= 8 && characters[i]) characters[i] = characters[i].toUpperCase();
		if ((hash[i >> 1] & 15) >= 8 && characters[i + 1]) characters[i + 1] = characters[i + 1].toUpperCase();
	}
	const result = `0x${characters.join("")}`;
	checksum$1.set(address, result);
	return result;
}
/**
* Checks if the given address is a valid {@link ox#Address.Address}.
*
* @example
* ```ts twoslash
* import { Address } from 'ox'
*
* Address.validate('0xA0Cf798816D4b9b9866b5330EEa46a18382f251e')
* // @log: true
* ```
*
* @example
* ```ts twoslash
* import { Address } from 'ox'
*
* Address.validate('0xdeadbeef')
* // @log: false
* ```
*
* @param address - Value to check if it is a valid address.
* @param options - Check options.
* @returns Whether the address is a valid address.
*/
function validate$2(address, options = {}) {
	const { strict = true } = options ?? {};
	try {
		assert$3(address, { strict });
		return true;
	} catch {
		return false;
	}
}
/**
* Thrown when an address is invalid.
*
* @example
* ```ts twoslash
* import { Address } from 'ox'
*
* Address.from('0x123')
* // @error: Address.InvalidAddressError: Address `0x123` is invalid.
* ```
*/
var InvalidAddressError = class extends BaseError {
	constructor({ address, cause }) {
		super(`Address "${address}" is invalid.`, { cause });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Address.InvalidAddressError"
		});
	}
};
/** Thrown when an address is not a 20 byte (40 hexadecimal character) value. */
var InvalidInputError = class extends BaseError {
	constructor() {
		super("Address is not a 20 byte (40 hexadecimal character) value.");
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Address.InvalidInputError"
		});
	}
};
/** Thrown when an address does not match its checksum counterpart. */
var InvalidChecksumError = class extends BaseError {
	constructor() {
		super("Address does not match its checksum counterpart.");
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Address.InvalidChecksumError"
		});
	}
};
//#endregion
//#region node_modules/ox/_esm/core/Solidity.js
var arrayRegex = /^(.*)\[([0-9]*)\]$/;
var bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
var integerRegex = /^(u?int)(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
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
//#region node_modules/ox/_esm/core/internal/abiParameters.js
/** @internal */
function decodeParameter(cursor, param, options) {
	const { checksumAddress, staticPosition } = options;
	const arrayComponents = getArrayComponents(param.type);
	if (arrayComponents) {
		const [length, type] = arrayComponents;
		return decodeArray(cursor, {
			...param,
			type
		}, {
			checksumAddress,
			length,
			staticPosition
		});
	}
	if (param.type === "tuple") return decodeTuple(cursor, param, {
		checksumAddress,
		staticPosition
	});
	if (param.type === "address") return decodeAddress(cursor, { checksum: checksumAddress });
	if (param.type === "bool") return decodeBool(cursor);
	if (param.type.startsWith("bytes")) return decodeBytes(cursor, param, { staticPosition });
	if (param.type.startsWith("uint") || param.type.startsWith("int")) return decodeNumber(cursor, param);
	if (param.type === "string") return decodeString(cursor, { staticPosition });
	throw new InvalidTypeError(param.type);
}
var sizeOfLength = 32;
var sizeOfOffset = 32;
/** @internal */
function decodeAddress(cursor, options = {}) {
	const { checksum: checksum$2 = false } = options;
	const value = cursor.readBytes(32);
	const wrap = (address) => checksum$2 ? checksum(address) : address;
	return [wrap(fromBytes$1(slice$1(value, -20))), 32];
}
/** @internal */
function decodeArray(cursor, param, options) {
	const { checksumAddress, length, staticPosition } = options;
	if (length === null) {
		const start = staticPosition + toNumber$1(cursor.readBytes(sizeOfOffset));
		const startOfData = start + sizeOfLength;
		cursor.setPosition(start);
		const length = toNumber$1(cursor.readBytes(sizeOfLength));
		const dynamicChild = hasDynamicChild(param);
		let consumed = 0;
		const value = [];
		for (let i = 0; i < length; ++i) {
			cursor.setPosition(startOfData + (dynamicChild ? i * 32 : consumed));
			const [data, consumed_] = decodeParameter(cursor, param, {
				checksumAddress,
				staticPosition: startOfData
			});
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
		const start = staticPosition + toNumber$1(cursor.readBytes(sizeOfOffset));
		const value = [];
		for (let i = 0; i < length; ++i) {
			cursor.setPosition(start + i * 32);
			const [data] = decodeParameter(cursor, param, {
				checksumAddress,
				staticPosition: start
			});
			value.push(data);
		}
		cursor.setPosition(staticPosition + 32);
		return [value, 32];
	}
	let consumed = 0;
	const value = [];
	for (let i = 0; i < length; ++i) {
		const [data, consumed_] = decodeParameter(cursor, param, {
			checksumAddress,
			staticPosition: staticPosition + consumed
		});
		consumed += consumed_;
		value.push(data);
		if (consumed_ === 0) {
			cursor.assertReadLimit();
			cursor._touch();
		}
	}
	return [value, consumed];
}
/** @internal */
function decodeBool(cursor) {
	return [toBoolean(cursor.readBytes(32), { size: 32 }), 32];
}
/** @internal */
function decodeBytes(cursor, param, { staticPosition }) {
	const [_, size] = param.type.split("bytes");
	if (!size) {
		const offset = toNumber$1(cursor.readBytes(32));
		cursor.setPosition(staticPosition + offset);
		const length = toNumber$1(cursor.readBytes(32));
		if (length === 0) {
			cursor.setPosition(staticPosition + 32);
			return ["0x", 32];
		}
		const data = cursor.readBytes(length);
		cursor.setPosition(staticPosition + 32);
		return [fromBytes$1(data), 32];
	}
	return [fromBytes$1(cursor.readBytes(Number.parseInt(size, 10), 32)), 32];
}
/** @internal */
function decodeNumber(cursor, param) {
	const signed = param.type.startsWith("int");
	const size = Number.parseInt(param.type.split("int")[1] || "256", 10);
	const value = cursor.readBytes(32);
	return [size > 48 ? toBigInt$1(value, { signed }) : toNumber$1(value, { signed }), 32];
}
/** @internal */
function decodeTuple(cursor, param, options) {
	const { checksumAddress, staticPosition } = options;
	const hasUnnamedChild = param.components.length === 0 || param.components.some(({ name }) => !name);
	const value = hasUnnamedChild ? [] : {};
	let consumed = 0;
	if (hasDynamicChild(param)) {
		const start = staticPosition + toNumber$1(cursor.readBytes(sizeOfOffset));
		for (let i = 0; i < param.components.length; ++i) {
			const component = param.components[i];
			cursor.setPosition(start + consumed);
			const [data, consumed_] = decodeParameter(cursor, component, {
				checksumAddress,
				staticPosition: start
			});
			consumed += consumed_;
			value[hasUnnamedChild ? i : component?.name] = data;
		}
		cursor.setPosition(staticPosition + 32);
		return [value, 32];
	}
	for (let i = 0; i < param.components.length; ++i) {
		const component = param.components[i];
		const [data, consumed_] = decodeParameter(cursor, component, {
			checksumAddress,
			staticPosition
		});
		value[hasUnnamedChild ? i : component?.name] = data;
		consumed += consumed_;
	}
	return [value, consumed];
}
/** @internal */
function decodeString(cursor, { staticPosition }) {
	const start = staticPosition + toNumber$1(cursor.readBytes(32));
	cursor.setPosition(start);
	const length = toNumber$1(cursor.readBytes(32));
	if (length === 0) {
		cursor.setPosition(staticPosition + 32);
		return ["", 32];
	}
	const value = toString(trimLeft(cursor.readBytes(length, 32)));
	cursor.setPosition(staticPosition + 32);
	return [value, 32];
}
/** @internal */
function prepareParameters({ checksumAddress, parameters, values }) {
	const preparedParameters = [];
	for (let i = 0; i < parameters.length; i++) preparedParameters.push(prepareParameter({
		checksumAddress,
		parameter: parameters[i],
		value: values[i]
	}));
	return preparedParameters;
}
/** @internal */
function prepareParameter({ checksumAddress = false, parameter: parameter_, value }) {
	const parameter = parameter_;
	const arrayComponents = getArrayComponents(parameter.type);
	if (arrayComponents) {
		const [length, type] = arrayComponents;
		return encodeArray(value, {
			checksumAddress,
			length,
			parameter: {
				...parameter,
				type
			}
		});
	}
	if (parameter.type === "tuple") return encodeTuple(value, {
		checksumAddress,
		parameter
	});
	if (parameter.type === "address") return encodeAddress(value, { checksum: checksumAddress });
	if (parameter.type === "bool") return encodeBoolean(value);
	if (parameter.type.startsWith("uint") || parameter.type.startsWith("int")) {
		const signed = parameter.type.startsWith("int");
		const [, , size = "256"] = integerRegex.exec(parameter.type) ?? [];
		return encodeNumber(value, {
			signed,
			size: Number(size)
		});
	}
	if (parameter.type.startsWith("bytes")) return encodeBytes(value, { type: parameter.type });
	if (parameter.type === "string") return encodeString(value);
	throw new InvalidTypeError(parameter.type);
}
/** @internal */
function encode$2(preparedParameters) {
	let staticSize = 0;
	for (let i = 0; i < preparedParameters.length; i++) {
		const { dynamic, encoded } = preparedParameters[i];
		if (dynamic) staticSize += 32;
		else staticSize += size(encoded);
	}
	const staticParameters = [];
	const dynamicParameters = [];
	let dynamicSize = 0;
	for (let i = 0; i < preparedParameters.length; i++) {
		const { dynamic, encoded } = preparedParameters[i];
		if (dynamic) {
			staticParameters.push(fromNumber(staticSize + dynamicSize, { size: 32 }));
			dynamicParameters.push(encoded);
			dynamicSize += size(encoded);
		} else staticParameters.push(encoded);
	}
	return concat(...staticParameters, ...dynamicParameters);
}
/** @internal */
function encodeAddress(value, options) {
	const { checksum = false } = options;
	assert$3(value, { strict: checksum });
	return {
		dynamic: false,
		encoded: padLeft(value.toLowerCase())
	};
}
/** @internal */
function encodeArray(value, options) {
	const { checksumAddress, length, parameter } = options;
	const dynamic = length === null;
	if (!Array.isArray(value)) throw new InvalidArrayError(value);
	if (!dynamic && value.length !== length) throw new ArrayLengthMismatchError({
		expectedLength: length,
		givenLength: value.length,
		type: `${parameter.type}[${length}]`
	});
	let dynamicChild = value.length === 0 && hasDynamicChild(parameter);
	const preparedParameters = [];
	for (let i = 0; i < value.length; i++) {
		const preparedParam = prepareParameter({
			checksumAddress,
			parameter,
			value: value[i]
		});
		if (preparedParam.dynamic) dynamicChild = true;
		preparedParameters.push(preparedParam);
	}
	if (dynamic || dynamicChild) {
		const data = encode$2(preparedParameters);
		if (dynamic) {
			const length = fromNumber(preparedParameters.length, { size: 32 });
			return {
				dynamic: true,
				encoded: preparedParameters.length > 0 ? concat(length, data) : length
			};
		}
		if (dynamicChild) return {
			dynamic: true,
			encoded: data
		};
	}
	return {
		dynamic: false,
		encoded: concat(...preparedParameters.map(({ encoded }) => encoded))
	};
}
/** @internal */
function encodeBytes(value, { type }) {
	const [, parametersize] = type.split("bytes");
	const bytesSize = size(value);
	if (!parametersize) {
		let value_ = value;
		if (bytesSize % 32 !== 0) value_ = padRight(value_, Math.ceil((value.length - 2) / 2 / 32) * 32);
		return {
			dynamic: true,
			encoded: concat(padLeft(fromNumber(bytesSize, { size: 32 })), value_)
		};
	}
	if (bytesSize !== Number.parseInt(parametersize, 10)) throw new BytesSizeMismatchError({
		expectedSize: Number.parseInt(parametersize, 10),
		value
	});
	return {
		dynamic: false,
		encoded: padRight(value)
	};
}
/** @internal */
function encodeBoolean(value) {
	if (typeof value !== "boolean") throw new BaseError(`Invalid boolean value: "${value}" (type: ${typeof value}). Expected: \`true\` or \`false\`.`);
	return {
		dynamic: false,
		encoded: padLeft(fromBoolean(value))
	};
}
/** @internal */
function encodeNumber(value, { signed, size }) {
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
		encoded: fromNumber(value, {
			size: 32,
			signed
		})
	};
}
/** @internal */
function encodeString(value) {
	const hexValue = fromString(value);
	const partsLength = Math.ceil(size(hexValue) / 32);
	const parts = [];
	for (let i = 0; i < partsLength; i++) parts.push(padRight(slice(hexValue, i * 32, (i + 1) * 32)));
	return {
		dynamic: true,
		encoded: concat(padRight(fromNumber(size(hexValue), { size: 32 })), ...parts)
	};
}
/** @internal */
function encodeTuple(value, options) {
	const { checksumAddress, parameter } = options;
	let dynamic = false;
	const preparedParameters = [];
	for (let i = 0; i < parameter.components.length; i++) {
		const param_ = parameter.components[i];
		const preparedParam = prepareParameter({
			checksumAddress,
			parameter: param_,
			value: value[Array.isArray(value) ? i : param_.name]
		});
		preparedParameters.push(preparedParam);
		if (preparedParam.dynamic) dynamic = true;
	}
	return {
		dynamic,
		encoded: dynamic ? encode$2(preparedParameters) : concat(...preparedParameters.map(({ encoded }) => encoded))
	};
}
/** @internal */
function getArrayComponents(type) {
	const matches = type.match(/^(.*)\[(\d+)?\]$/);
	return matches ? [matches[2] ? Number(matches[2]) : null, matches[1]] : void 0;
}
/** @internal */
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
//#region node_modules/ox/_esm/core/internal/cursor.js
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
/** @internal */
function create(bytes, { recursiveReadLimit = 8192 } = {}) {
	const cursor = Object.create(staticCursor);
	cursor.bytes = bytes;
	cursor.dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
	cursor.positionReadCount = /* @__PURE__ */ new Map();
	cursor.recursiveReadLimit = recursiveReadLimit;
	return cursor;
}
/** @internal */
var NegativeOffsetError = class extends BaseError {
	constructor({ offset }) {
		super(`Offset \`${offset}\` cannot be negative.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Cursor.NegativeOffsetError"
		});
	}
};
/** @internal */
var PositionOutOfBoundsError = class extends BaseError {
	constructor({ length, position }) {
		super(`Position \`${position}\` is out of bounds (\`0 < position < ${length}\`).`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Cursor.PositionOutOfBoundsError"
		});
	}
};
/** @internal */
var RecursiveReadLimitExceededError = class extends BaseError {
	constructor({ count, limit }) {
		super(`Recursive read limit of \`${limit}\` exceeded (recursive read count: \`${count}\`).`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Cursor.RecursiveReadLimitExceededError"
		});
	}
};
//#endregion
//#region node_modules/ox/_esm/core/AbiParameters.js
function decode(parameters, data, options = {}) {
	const { as = "Array", checksumAddress = false } = options;
	const bytes = typeof data === "string" ? fromHex$1(data) : data;
	const cursor = create(bytes);
	if (size$1(bytes) === 0 && parameters.length > 0) throw new ZeroDataError();
	if (size$1(bytes) && size$1(bytes) < 32) throw new DataSizeTooSmallError({
		data: typeof data === "string" ? data : fromBytes$1(data),
		parameters,
		size: size$1(bytes)
	});
	let consumed = 0;
	const values = as === "Array" ? [] : {};
	for (let i = 0; i < parameters.length; ++i) {
		const param = parameters[i];
		if (consumed < bytes.length) cursor.setPosition(consumed);
		const [data, consumed_] = decodeParameter(cursor, param, {
			checksumAddress,
			staticPosition: 0
		});
		consumed += consumed_;
		if (as === "Array") values.push(data);
		else values[param.name ?? i] = data;
	}
	return values;
}
/**
* Encodes primitive values into ABI encoded data as per the [Application Binary Interface (ABI) Specification](https://docs.soliditylang.org/en/latest/abi-spec).
*
* @example
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* const data = AbiParameters.encode(
*   AbiParameters.from(['string', 'uint', 'bool']),
*   ['wagmi', 420n, true],
* )
* ```
*
* @example
* ### JSON Parameters
*
* Specify **JSON ABI** Parameters as schema:
*
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* const data = AbiParameters.encode(
*   [
*     { type: 'string', name: 'name' },
*     { type: 'uint', name: 'age' },
*     { type: 'bool', name: 'isOwner' },
*   ],
*   ['wagmi', 420n, true],
* )
* ```
*
* @param parameters - The set of ABI parameters to encode, in the shape of the `inputs` or `outputs` attribute of an ABI Item. These parameters must include valid [ABI types](https://docs.soliditylang.org/en/latest/types.html).
* @param values - The set of primitive values that correspond to the ABI types defined in `parameters`.
* @returns ABI encoded data.
*/
function encode$1(parameters, values, options) {
	const { checksumAddress = false } = options ?? {};
	if (parameters.length !== values.length) throw new LengthMismatchError({
		expectedLength: parameters.length,
		givenLength: values.length
	});
	const data = encode$2(prepareParameters({
		checksumAddress,
		parameters,
		values
	}));
	if (data.length === 0) return "0x";
	return data;
}
/**
* Encodes an array of primitive values to a [packed ABI encoding](https://docs.soliditylang.org/en/latest/abi-spec.html#non-standard-packed-mode).
*
* @example
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* const encoded = AbiParameters.encodePacked(
*   ['address', 'string'],
*   ['0xd8da6bf26964af9d7eed9e03e53415d37aa96045', 'hello world'],
* )
* // @log: '0xd8da6bf26964af9d7eed9e03e53415d37aa9604568656c6c6f20776f726c64'
* ```
*
* @param types - Set of ABI types to pack encode.
* @param values - The set of primitive values that correspond to the ABI types defined in `types`.
* @returns The encoded packed data.
*/
function encodePacked(types, values) {
	if (types.length !== values.length) throw new LengthMismatchError({
		expectedLength: types.length,
		givenLength: values.length
	});
	const data = [];
	for (let i = 0; i < types.length; i++) {
		const type = types[i];
		const value = values[i];
		data.push(encodePacked.encode(type, value));
	}
	return concat(...data);
}
(function(encodePacked) {
	function encode(type, value, isArray = false) {
		if (type === "address") {
			const address = value;
			assert$3(address);
			return padLeft(address.toLowerCase(), isArray ? 32 : 0);
		}
		if (type === "string") return fromString(value);
		if (type === "bytes") return value;
		if (type === "bool") return padLeft(fromBoolean(value), isArray ? 32 : 1);
		const intMatch = type.match(integerRegex);
		if (intMatch) {
			const [_type, baseType, bits = "256"] = intMatch;
			const size = Number.parseInt(bits, 10) / 8;
			return fromNumber(value, {
				size: isArray ? 32 : size,
				signed: baseType === "int"
			});
		}
		const bytesMatch = type.match(bytesRegex);
		if (bytesMatch) {
			const [_type, size] = bytesMatch;
			if (Number.parseInt(size, 10) !== (value.length - 2) / 2) throw new BytesSizeMismatchError({
				expectedSize: Number.parseInt(size, 10),
				value
			});
			return padRight(value, isArray ? 32 : 0);
		}
		const arrayMatch = type.match(arrayRegex);
		if (arrayMatch && Array.isArray(value)) {
			const [_type, childType] = arrayMatch;
			const data = [];
			for (let i = 0; i < value.length; i++) data.push(encode(childType, value[i], true));
			if (data.length === 0) return "0x";
			return concat(...data);
		}
		throw new InvalidTypeError(type);
	}
	encodePacked.encode = encode;
})(encodePacked || (encodePacked = {}));
/**
* Parses arbitrary **JSON ABI Parameters** or **Human Readable ABI Parameters** into typed {@link ox#AbiParameters.AbiParameters}.
*
* @example
* ### JSON Parameters
*
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* const parameters = AbiParameters.from([
*   {
*     name: 'spender',
*     type: 'address',
*   },
*   {
*     name: 'amount',
*     type: 'uint256',
*   },
* ])
*
* parameters
* //^?
*
*
*
*
*
*
*
* ```
*
* @example
* ### Human Readable Parameters
*
* Human Readable ABI Parameters can be parsed into a typed {@link ox#AbiParameters.AbiParameters}:
*
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* const parameters = AbiParameters.from('address spender, uint256 amount')
*
* parameters
* //^?
*
*
*
*
*
*
*
* ```
*
* @example
* It is possible to specify `struct`s along with your definitions:
*
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* const parameters = AbiParameters.from([
*   'struct Foo { address spender; uint256 amount; }', // [!code hl]
*   'Foo foo, address bar',
* ])
*
* parameters
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
*
*
* @param parameters - The ABI Parameters to parse.
* @returns The typed ABI Parameters.
*/
function from$6(parameters) {
	if (Array.isArray(parameters) && typeof parameters[0] === "string") return parseAbiParameters(parameters);
	if (typeof parameters === "string") return parseAbiParameters(parameters);
	return parameters;
}
/**
* Throws when the data size is too small for the given parameters.
*
* @example
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* AbiParameters.decode([{ type: 'uint256' }], '0x010f')
* //                                             ↑ ❌ 2 bytes
* // @error: AbiParameters.DataSizeTooSmallError: Data size of 2 bytes is too small for given parameters.
* // @error: Params: (uint256)
* // @error: Data:   0x010f (2 bytes)
* ```
*
* ### Solution
*
* Pass a valid data size.
*
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* AbiParameters.decode([{ type: 'uint256' }], '0x00000000000000000000000000000000000000000000000000000000000010f')
* //                                             ↑ ✅ 32 bytes
* ```
*/
var DataSizeTooSmallError = class extends BaseError {
	constructor({ data, parameters, size }) {
		super(`Data size of ${size} bytes is too small for given parameters.`, { metaMessages: [`Params: (${formatAbiParameters(parameters)})`, `Data:   ${data} (${size} bytes)`] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiParameters.DataSizeTooSmallError"
		});
	}
};
/**
* Throws when zero data is provided, but data is expected.
*
* @example
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* AbiParameters.decode([{ type: 'uint256' }], '0x')
* //                                           ↑ ❌ zero data
* // @error: AbiParameters.DataSizeTooSmallError: Data size of 2 bytes is too small for given parameters.
* // @error: Params: (uint256)
* // @error: Data:   0x010f (2 bytes)
* ```
*
* ### Solution
*
* Pass valid data.
*
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* AbiParameters.decode([{ type: 'uint256' }], '0x00000000000000000000000000000000000000000000000000000000000010f')
* //                                             ↑ ✅ 32 bytes
* ```
*/
var ZeroDataError = class extends BaseError {
	constructor() {
		super("Cannot decode zero data (\"0x\") with ABI parameters.");
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiParameters.ZeroDataError"
		});
	}
};
/**
* The length of the array value does not match the length specified in the corresponding ABI parameter.
*
* ### Example
*
* ```ts twoslash
* // @noErrors
* import { AbiParameters } from 'ox'
* // ---cut---
* AbiParameters.encode(AbiParameters.from('uint256[3]'), [[69n, 420n]])
* //                                               ↑ expected: 3  ↑ ❌ length: 2
* // @error: AbiParameters.ArrayLengthMismatchError: ABI encoding array length mismatch
* // @error: for type `uint256[3]`. Expected: `3`. Given: `2`.
* ```
*
* ### Solution
*
* Pass an array of the correct length.
*
* ```ts twoslash
* import { AbiParameters } from 'ox'
* // ---cut---
* AbiParameters.encode(AbiParameters.from(['uint256[3]']), [[69n, 420n, 69n]])
* //                                                         ↑ ✅ length: 3
* ```
*/
var ArrayLengthMismatchError = class extends BaseError {
	constructor({ expectedLength, givenLength, type }) {
		super(`Array length mismatch for type \`${type}\`. Expected: \`${expectedLength}\`. Given: \`${givenLength}\`.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiParameters.ArrayLengthMismatchError"
		});
	}
};
/**
* The size of the bytes value does not match the size specified in the corresponding ABI parameter.
*
* ### Example
*
* ```ts twoslash
* // @noErrors
* import { AbiParameters } from 'ox'
* // ---cut---
* AbiParameters.encode(AbiParameters.from('bytes8'), [['0xdeadbeefdeadbeefdeadbeef']])
* //                                            ↑ expected: 8 bytes  ↑ ❌ size: 12 bytes
* // @error: BytesSizeMismatchError: Size of bytes "0xdeadbeefdeadbeefdeadbeef"
* // @error: (bytes12) does not match expected size (bytes8).
* ```
*
* ### Solution
*
* Pass a bytes value of the correct size.
*
* ```ts twoslash
* import { AbiParameters } from 'ox'
* // ---cut---
* AbiParameters.encode(AbiParameters.from(['bytes8']), ['0xdeadbeefdeadbeef'])
* //                                                       ↑ ✅ size: 8 bytes
* ```
*/
var BytesSizeMismatchError = class extends BaseError {
	constructor({ expectedSize, value }) {
		super(`Size of bytes "${value}" (bytes${size(value)}) does not match expected size (bytes${expectedSize}).`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiParameters.BytesSizeMismatchError"
		});
	}
};
/**
* The length of the values to encode does not match the length of the ABI parameters.
*
* ### Example
*
* ```ts twoslash
* // @noErrors
* import { AbiParameters } from 'ox'
* // ---cut---
* AbiParameters.encode(AbiParameters.from(['string', 'uint256']), ['hello'])
* // @error: LengthMismatchError: ABI encoding params/values length mismatch.
* // @error: Expected length (params): 2
* // @error: Given length (values): 1
* ```
*
* ### Solution
*
* Pass the correct number of values to encode.
*
* ### Solution
*
* Pass a [valid ABI type](https://docs.soliditylang.org/en/develop/abi-spec.html#types).
*/
var LengthMismatchError = class extends BaseError {
	constructor({ expectedLength, givenLength }) {
		super([
			"ABI encoding parameters/values length mismatch.",
			`Expected length (parameters): ${expectedLength}`,
			`Given length (values): ${givenLength}`
		].join("\n"));
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiParameters.LengthMismatchError"
		});
	}
};
/**
* The value provided is not a valid array as specified in the corresponding ABI parameter.
*
* ### Example
*
* ```ts twoslash
* // @noErrors
* import { AbiParameters } from 'ox'
* // ---cut---
* AbiParameters.encode(AbiParameters.from(['uint256[3]']), [69])
* ```
*
* ### Solution
*
* Pass an array value.
*/
var InvalidArrayError = class extends BaseError {
	constructor(value) {
		super(`Value \`${value}\` is not a valid array.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiParameters.InvalidArrayError"
		});
	}
};
/**
* Throws when the ABI parameter type is invalid.
*
* @example
* ```ts twoslash
* import { AbiParameters } from 'ox'
*
* AbiParameters.decode([{ type: 'lol' }], '0x00000000000000000000000000000000000000000000000000000000000010f')
* //                             ↑ ❌ invalid type
* // @error: AbiParameters.InvalidTypeError: Type `lol` is not a valid ABI Type.
* ```
*/
var InvalidTypeError = class extends BaseError {
	constructor(type) {
		super(`Type \`${type}\` is not a valid ABI Type.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiParameters.InvalidTypeError"
		});
	}
};
//#endregion
//#region node_modules/ox/_esm/core/Signature.js
/**
* Asserts that a Signature is valid.
*
* @example
* ```ts twoslash
* import { Signature } from 'ox'
*
* Signature.assert({
*   r: -49782753348462494199823712700004552394425719014458918871452329774910450607807n,
*   s: 33726695977844476214676913201140481102225469284307016937915595756355928419768n,
*   yParity: 1,
* })
* // @error: InvalidSignatureRError:
* // @error: Value `-549...n` is an invalid r value.
* // @error: r must be a positive integer less than 2^256.
* ```
*
* @param signature - The signature object to assert.
*/
function assert$2(signature, options = {}) {
	const { recovered } = options;
	if (typeof signature.r === "undefined") throw new MissingPropertiesError({ signature });
	if (typeof signature.s === "undefined") throw new MissingPropertiesError({ signature });
	if (recovered && typeof signature.yParity === "undefined") throw new MissingPropertiesError({ signature });
	if (signature.r < 0n || signature.r > maxUint256) throw new InvalidRError({ value: signature.r });
	if (signature.s < 0n || signature.s > maxUint256) throw new InvalidSError({ value: signature.s });
	if (typeof signature.yParity === "number" && signature.yParity !== 0 && signature.yParity !== 1) throw new InvalidYParityError({ value: signature.yParity });
}
/**
* Deserializes a {@link ox#Bytes.Bytes} signature into a structured {@link ox#Signature.Signature}.
*
* @example
* ```ts twoslash
* // @noErrors
* import { Signature } from 'ox'
*
* Signature.fromBytes(new Uint8Array([128, 3, 131, ...]))
* // @log: { r: 5231...n, s: 3522...n, yParity: 0 }
* ```
*
* @param signature - The serialized signature.
* @returns The deserialized {@link ox#Signature.Signature}.
*/
function fromBytes(signature) {
	return fromHex(fromBytes$1(signature));
}
/**
* Deserializes a {@link ox#Hex.Hex} signature into a structured {@link ox#Signature.Signature}.
*
* @example
* ```ts twoslash
* import { Signature } from 'ox'
*
* Signature.fromHex('0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db81c')
* // @log: { r: 5231...n, s: 3522...n, yParity: 0 }
* ```
*
* @param serialized - The serialized signature.
* @returns The deserialized {@link ox#Signature.Signature}.
*/
function fromHex(signature) {
	if (signature.length !== 130 && signature.length !== 132) throw new InvalidSerializedSizeError({ signature });
	const r = BigInt(slice(signature, 0, 32));
	const s = BigInt(slice(signature, 32, 64));
	const yParity = (() => {
		const yParity = Number(`0x${signature.slice(130)}`);
		if (Number.isNaN(yParity)) return void 0;
		try {
			return vToYParity(yParity);
		} catch {
			throw new InvalidYParityError({ value: yParity });
		}
	})();
	if (typeof yParity === "undefined") return {
		r,
		s
	};
	return {
		r,
		s,
		yParity
	};
}
/**
* Extracts a {@link ox#Signature.Signature} from an arbitrary object that may include signature properties.
*
* @example
* ```ts twoslash
* // @noErrors
* import { Signature } from 'ox'
*
* Signature.extract({
*   baz: 'barry',
*   foo: 'bar',
*   r: 49782753348462494199823712700004552394425719014458918871452329774910450607807n,
*   s: 33726695977844476214676913201140481102225469284307016937915595756355928419768n,
*   yParity: 1,
*   zebra: 'stripes',
* })
* // @log: {
* // @log:   r: 49782753348462494199823712700004552394425719014458918871452329774910450607807n,
* // @log:   s: 33726695977844476214676913201140481102225469284307016937915595756355928419768n,
* // @log:   yParity: 1
* // @log: }
* ```
*
* @param value - The arbitrary object to extract the signature from.
* @returns The extracted {@link ox#Signature.Signature}.
*/
function extract(value) {
	if (typeof value.r === "undefined") return void 0;
	if (typeof value.s === "undefined") return void 0;
	return from$5(value);
}
/**
* Instantiates a typed {@link ox#Signature.Signature} object from a {@link ox#Signature.Signature}, {@link ox#Signature.Legacy}, {@link ox#Bytes.Bytes}, or {@link ox#Hex.Hex}.
*
* @example
* ```ts twoslash
* import { Signature } from 'ox'
*
* Signature.from({
*   r: 49782753348462494199823712700004552394425719014458918871452329774910450607807n,
*   s: 33726695977844476214676913201140481102225469284307016937915595756355928419768n,
*   yParity: 1,
* })
* // @log: {
* // @log:   r: 49782753348462494199823712700004552394425719014458918871452329774910450607807n,
* // @log:   s: 33726695977844476214676913201140481102225469284307016937915595756355928419768n,
* // @log:   yParity: 1
* // @log: }
* ```
*
* @example
* ### From Serialized
*
* ```ts twoslash
* import { Signature } from 'ox'
*
* Signature.from('0x6e100a352ec6ad1b70802290e18aeed190704973570f3b8ed42cb9808e2ea6bf4a90a229a244495b41890987806fcbd2d5d23fc0dbe5f5256c2613c039d76db801')
* // @log: {
* // @log:   r: 49782753348462494199823712700004552394425719014458918871452329774910450607807n,
* // @log:   s: 33726695977844476214676913201140481102225469284307016937915595756355928419768n,
* // @log:   yParity: 1,
* // @log: }
* ```
*
* @example
* ### From Legacy
*
* ```ts twoslash
* import { Signature } from 'ox'
*
* Signature.from({
*   r: 47323457007453657207889730243826965761922296599680473886588287015755652701072n,
*   s: 57228803202727131502949358313456071280488184270258293674242124340113824882788n,
*   v: 27,
* })
* // @log: {
* // @log:   r: 47323457007453657207889730243826965761922296599680473886588287015755652701072n,
* // @log:   s: 57228803202727131502949358313456071280488184270258293674242124340113824882788n,
* // @log:   yParity: 0
* // @log: }
* ```
*
* @param signature - The signature value to instantiate.
* @returns The instantiated {@link ox#Signature.Signature}.
*/
function from$5(signature) {
	const signature_ = (() => {
		if (typeof signature === "string") return fromHex(signature);
		if (signature instanceof Uint8Array) return fromBytes(signature);
		if (typeof signature.r === "string") return fromRpc$1(signature);
		if (signature.v) return fromLegacy(signature);
		return {
			r: signature.r,
			s: signature.s,
			...typeof signature.yParity !== "undefined" ? { yParity: signature.yParity } : {}
		};
	})();
	assert$2(signature_);
	return signature_;
}
/**
* Converts a {@link ox#Signature.Legacy} into a {@link ox#Signature.Signature}.
*
* @example
* ```ts twoslash
* import { Signature } from 'ox'
*
* const legacy = Signature.fromLegacy({ r: 1n, s: 2n, v: 28 })
* // @log: { r: 1n, s: 2n, yParity: 1 }
* ```
*
* @param signature - The {@link ox#Signature.Legacy} to convert.
* @returns The converted {@link ox#Signature.Signature}.
*/
function fromLegacy(signature) {
	return {
		r: signature.r,
		s: signature.s,
		yParity: vToYParity(signature.v)
	};
}
/**
* Converts a {@link ox#Signature.Rpc} into a {@link ox#Signature.Signature}.
*
* @example
* ```ts twoslash
* import { Signature } from 'ox'
*
* const signature = Signature.fromRpc({
*   r: '0x635dc2033e60185bb36709c29c75d64ea51dfbd91c32ef4be198e4ceb169fb4d',
*   s: '0x50c2667ac4c771072746acfdcf1f1483336dcca8bd2df47cd83175dbe60f0540',
*   yParity: '0x0',
* })
* ```
*
* @param signature - The {@link ox#Signature.Rpc} to convert.
* @returns The converted {@link ox#Signature.Signature}.
*/
function fromRpc$1(signature) {
	const yParity = (() => {
		const v = signature.v ? Number(signature.v) : void 0;
		let yParity = signature.yParity ? Number(signature.yParity) : void 0;
		if (typeof v === "number" && typeof yParity !== "number") yParity = vToYParity(v);
		if (typeof yParity !== "number") throw new InvalidYParityError({ value: signature.yParity });
		return yParity;
	})();
	return {
		r: BigInt(signature.r),
		s: BigInt(signature.s),
		yParity
	};
}
/**
* Converts a ECDSA `v` value to a `yParity` value.
*
* @example
* ```ts twoslash
* import { Signature } from 'ox'
*
* const yParity = Signature.vToYParity(28)
* // @log: 1
* ```
*
* @param v - The ECDSA `v` value to convert.
* @returns The `yParity` value.
*/
function vToYParity(v) {
	if (v === 0 || v === 27) return 0;
	if (v === 1 || v === 28) return 1;
	if (v >= 35) return v % 2 === 0 ? 1 : 0;
	throw new InvalidVError({ value: v });
}
/** Thrown when the serialized signature is of an invalid size. */
var InvalidSerializedSizeError = class extends BaseError {
	constructor({ signature }) {
		super(`Value \`${signature}\` is an invalid signature size.`, { metaMessages: ["Expected: 64 bytes or 65 bytes.", `Received ${size(from$7(signature))} bytes.`] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Signature.InvalidSerializedSizeError"
		});
	}
};
/** Thrown when the signature is missing either an `r`, `s`, or `yParity` property. */
var MissingPropertiesError = class extends BaseError {
	constructor({ signature }) {
		super(`Signature \`${stringify(signature)}\` is missing either an \`r\`, \`s\`, or \`yParity\` property.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Signature.MissingPropertiesError"
		});
	}
};
/** Thrown when the signature has an invalid `r` value. */
var InvalidRError = class extends BaseError {
	constructor({ value }) {
		super(`Value \`${value}\` is an invalid r value. r must be a positive integer less than 2^256.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Signature.InvalidRError"
		});
	}
};
/** Thrown when the signature has an invalid `s` value. */
var InvalidSError = class extends BaseError {
	constructor({ value }) {
		super(`Value \`${value}\` is an invalid s value. s must be a positive integer less than 2^256.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Signature.InvalidSError"
		});
	}
};
/** Thrown when the signature has an invalid `yParity` value. */
var InvalidYParityError = class extends BaseError {
	constructor({ value }) {
		super(`Value \`${value}\` is an invalid y-parity value. Y-parity must be 0 or 1.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Signature.InvalidYParityError"
		});
	}
};
/** Thrown when the signature has an invalid `v` value. */
var InvalidVError = class extends BaseError {
	constructor({ value }) {
		super(`Value \`${value}\` is an invalid v value. v must be 27, 28 or >=35.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "Signature.InvalidVError"
		});
	}
};
//#endregion
//#region node_modules/ox/_esm/core/Authorization.js
/**
* Converts an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) Authorization object into a typed {@link ox#Authorization.Authorization}.
*
* @example
* An Authorization can be instantiated from an [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) Authorization tuple in object format.
*
* ```ts twoslash
* import { Authorization } from 'ox'
*
* const authorization = Authorization.from({
*   address: '0x1234567890abcdef1234567890abcdef12345678',
*   chainId: 1,
*   nonce: 69n,
* })
* ```
*
* @example
* ### Attaching Signatures
*
* A {@link ox#Signature.Signature} can be attached with the `signature` option. The example below demonstrates signing
* an Authorization with {@link ox#Secp256k1.(sign:function)}.
*
* ```ts twoslash
* import { Authorization, Secp256k1 } from 'ox'
*
* const authorization = Authorization.from({
*   address: '0xbe95c3f554e9fc85ec51be69a3d807a0d55bcf2c',
*   chainId: 1,
*   nonce: 40n,
* })
*
* const signature = Secp256k1.sign({
*   payload: Authorization.getSignPayload(authorization),
*   privateKey: '0x...',
* })
*
* const authorization_signed = Authorization.from(authorization, { signature }) // [!code focus]
* ```
*
* @param authorization - An [EIP-7702](https://eips.ethereum.org/EIPS/eip-7702) Authorization tuple in object format.
* @param options - Authorization options.
* @returns The {@link ox#Authorization.Authorization}.
*/
function from$4(authorization, options = {}) {
	if (typeof authorization.chainId === "string") return fromRpc(authorization);
	return {
		...authorization,
		...options.signature
	};
}
/**
* Converts an {@link ox#Authorization.Rpc} to an {@link ox#Authorization.Authorization}.
*
* @example
* ```ts twoslash
* import { Authorization } from 'ox'
*
* const authorization = Authorization.fromRpc({
*   address: '0x0000000000000000000000000000000000000000',
*   chainId: '0x1',
*   nonce: '0x1',
*   r: '0x635dc2033e60185bb36709c29c75d64ea51dfbd91c32ef4be198e4ceb169fb4d',
*   s: '0x50c2667ac4c771072746acfdcf1f1483336dcca8bd2df47cd83175dbe60f0540',
*   yParity: '0x0',
* })
* ```
*
* @param authorization - The RPC-formatted Authorization.
* @returns A signed {@link ox#Authorization.Authorization}.
*/
function fromRpc(authorization) {
	const { address, chainId, nonce } = authorization;
	const signature = extract(authorization);
	return {
		address,
		chainId: Number(chainId),
		nonce: BigInt(nonce),
		...signature
	};
}
/** Suffix ABI parameters for the ERC-8010 wrapped signature. */
var suffixParameters = from$6("(uint256 chainId, address delegation, uint256 nonce, uint8 yParity, uint256 r, uint256 s), address to, bytes data");
/**
* Asserts that the wrapped signature is valid.
*
* @example
* ```ts twoslash
* import { SignatureErc8010 } from 'ox/erc8010'
*
* SignatureErc8010.assert('0xdeadbeef')
* // @error: InvalidWrappedSignatureError: Value `0xdeadbeef` is an invalid ERC-8010 wrapped signature.
* ```
*
* @param value - The value to assert.
*/
function assert$1(value) {
	if (typeof value === "string") {
		if (slice(value, -32) !== "0x8010801080108010801080108010801080108010801080108010801080108010") throw new InvalidWrappedSignatureError$1(value);
	} else assert$2(value.authorization);
}
/**
* Unwraps an [ERC-8010 wrapped signature](https://github.com/jxom/ERCs/blob/16f7e3891fff2e1e9c25dea0485497739db8a816/ERCS/erc-8010.md) into its constituent parts.
*
* @example
* ```ts twoslash
* import { SignatureErc8010 } from 'ox/erc8010'
*
* const { authorization, data, signature } = SignatureErc8010.unwrap('0x...')
* ```
*
* @param wrapped - Wrapped signature to unwrap.
* @returns Unwrapped signature.
*/
function unwrap(wrapped) {
	assert$1(wrapped);
	const suffixLength = toNumber(slice(wrapped, -64, -32));
	const suffix = slice(wrapped, -suffixLength - 64, -64);
	const signature = slice(wrapped, 0, -suffixLength - 64);
	const [auth, to, data] = decode(suffixParameters, suffix);
	return {
		authorization: from$4({
			address: auth.delegation,
			chainId: Number(auth.chainId),
			nonce: auth.nonce,
			yParity: auth.yParity,
			r: auth.r,
			s: auth.s
		}),
		signature,
		...data && data !== "0x" ? {
			data,
			to
		} : {}
	};
}
/**
* Validates a wrapped signature. Returns `true` if the wrapped signature is valid, `false` otherwise.
*
* @example
* ```ts twoslash
* import { SignatureErc8010 } from 'ox/erc8010'
*
* const valid = SignatureErc8010.validate('0xdeadbeef')
* // @log: false
* ```
*
* @param value - The value to validate.
* @returns `true` if the value is valid, `false` otherwise.
*/
function validate$1(value) {
	try {
		assert$1(value);
		return true;
	} catch {
		return false;
	}
}
/** Thrown when the ERC-8010 wrapped signature is invalid. */
var InvalidWrappedSignatureError$1 = class extends BaseError {
	constructor(wrapped) {
		super(`Value \`${wrapped}\` is an invalid ERC-8010 wrapped signature.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "SignatureErc8010.InvalidWrappedSignatureError"
		});
	}
};
//#endregion
//#region node_modules/ox/_esm/core/internal/abiItem.js
/** @internal */
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
				"error",
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
/** @internal */
function isArgOfType(arg, abiParameter) {
	const argType = typeof arg;
	const abiParameterType = abiParameter.type;
	switch (abiParameterType) {
		case "address": return validate$2(arg, { strict: false });
		case "bool": return argType === "boolean";
		case "function": return argType === "string";
		case "string": return argType === "string";
		default:
			if (abiParameterType === "tuple" && "components" in abiParameter) return Object.values(abiParameter.components).every((component, index) => {
				return isArgOfType(Object.values(arg)[index], component);
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
			if (types.includes("address") && types.includes("string")) return validate$2(args[parameterIndex], { strict: false });
			if (types.includes("address") && types.includes("bytes")) return validate$2(args[parameterIndex], { strict: false });
			return false;
		})()) return types;
	}
}
//#endregion
//#region node_modules/ox/_esm/core/AbiItem.js
/**
* Parses an arbitrary **JSON ABI Item** or **Human Readable ABI Item** into a typed {@link ox#AbiItem.AbiItem}.
*
* @example
* ### JSON ABIs
*
* ```ts twoslash
* import { AbiItem } from 'ox'
*
* const abiItem = AbiItem.from({
*   type: 'function',
*   name: 'approve',
*   stateMutability: 'nonpayable',
*   inputs: [
*     {
*       name: 'spender',
*       type: 'address',
*     },
*     {
*       name: 'amount',
*       type: 'uint256',
*     },
*   ],
*   outputs: [{ type: 'bool' }],
* })
*
* abiItem
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
* @example
* ### Human Readable ABIs
*
* A Human Readable ABI can be parsed into a typed ABI object:
*
* ```ts twoslash
* import { AbiItem } from 'ox'
*
* const abiItem = AbiItem.from(
*   'function approve(address spender, uint256 amount) returns (bool)' // [!code hl]
* )
*
* abiItem
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
* @example
* It is possible to specify `struct`s along with your definitions:
*
* ```ts twoslash
* import { AbiItem } from 'ox'
*
* const abiItem = AbiItem.from([
*   'struct Foo { address spender; uint256 amount; }', // [!code hl]
*   'function approve(Foo foo) returns (bool)',
* ])
*
* abiItem
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
*
*
* @param abiItem - The ABI Item to parse.
* @returns The typed ABI Item.
*/
function from$3(abiItem, options = {}) {
	const { prepare = true } = options;
	const item = (() => {
		if (Array.isArray(abiItem)) return parseAbiItem(abiItem);
		if (typeof abiItem === "string") return parseAbiItem(abiItem);
		return abiItem;
	})();
	return {
		...item,
		...prepare ? { hash: getSignatureHash(item) } : {}
	};
}
/**
* Extracts an {@link ox#AbiItem.AbiItem} from an {@link ox#Abi.Abi} given a name and optional arguments.
*
* @example
* ABI Items can be extracted by their name using the `name` option:
*
* ```ts twoslash
* import { Abi, AbiItem } from 'ox'
*
* const abi = Abi.from([
*   'function foo()',
*   'event Transfer(address owner, address to, uint256 tokenId)',
*   'function bar(string a) returns (uint256 x)',
* ])
*
* const item = AbiItem.fromAbi(abi, 'Transfer') // [!code focus]
* //    ^?
*
*
*
*
*
*
* ```
*
* @example
* ### Extracting by Selector
*
* ABI Items can be extract by their selector when {@link ox#Hex.Hex} is provided to `name`.
*
* ```ts twoslash
* import { Abi, AbiItem } from 'ox'
*
* const abi = Abi.from([
*   'function foo()',
*   'event Transfer(address owner, address to, uint256 tokenId)',
*   'function bar(string a) returns (uint256 x)',
* ])
* const item = AbiItem.fromAbi(abi, '0x095ea7b3') // [!code focus]
* //    ^?
*
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
* :::note
*
* Extracting via a hex selector is useful when extracting an ABI Item from an `eth_call` RPC response,
* a Transaction `input`, or from Event Log `topics`.
*
* :::
*
* @param abi - The ABI to extract from.
* @param name - The name (or selector) of the ABI item to extract.
* @param options - Extraction options.
* @returns The ABI item.
*/
function fromAbi$2(abi, name, options) {
	const { args = [], prepare = true } = options ?? {};
	const isSelector = validate$3(name, { strict: false });
	const abiItems = abi.filter((abiItem) => {
		if (isSelector) {
			if (abiItem.type === "function" || abiItem.type === "error") return getSelector$2(abiItem) === slice(name, 0, 4);
			if (abiItem.type === "event") return getSignatureHash(abiItem) === name;
			return false;
		}
		return "name" in abiItem && abiItem.name === name;
	});
	if (abiItems.length === 0) throw new NotFoundError({ name });
	if (abiItems.length === 1) return {
		...abiItems[0],
		...prepare ? { hash: getSignatureHash(abiItems[0]) } : {}
	};
	let matchedAbiItem;
	for (const abiItem of abiItems) {
		if (!("inputs" in abiItem)) continue;
		if (!args || args.length === 0) {
			if (!abiItem.inputs || abiItem.inputs.length === 0) return {
				...abiItem,
				...prepare ? { hash: getSignatureHash(abiItem) } : {}
			};
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
				if (ambiguousTypes) throw new AmbiguityError({
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
	const abiItem = (() => {
		if (matchedAbiItem) return matchedAbiItem;
		const [abiItem, ...overloads] = abiItems;
		return {
			...abiItem,
			overloads
		};
	})();
	if (!abiItem) throw new NotFoundError({ name });
	return {
		...abiItem,
		...prepare ? { hash: getSignatureHash(abiItem) } : {}
	};
}
function getSelector$2(...parameters) {
	return slice(getSignatureHash((() => {
		if (Array.isArray(parameters[0])) {
			const [abi, name] = parameters;
			return fromAbi$2(abi, name);
		}
		return parameters[0];
	})()), 0, 4);
}
function getSignature(...parameters) {
	const abiItem = (() => {
		if (Array.isArray(parameters[0])) {
			const [abi, name] = parameters;
			return fromAbi$2(abi, name);
		}
		return parameters[0];
	})();
	return normalizeSignature((() => {
		if (typeof abiItem === "string") return abiItem;
		return formatAbiItem(abiItem);
	})());
}
function getSignatureHash(...parameters) {
	const abiItem = (() => {
		if (Array.isArray(parameters[0])) {
			const [abi, name] = parameters;
			return fromAbi$2(abi, name);
		}
		return parameters[0];
	})();
	if (typeof abiItem !== "string" && "hash" in abiItem && abiItem.hash) return abiItem.hash;
	return keccak256(fromString(getSignature(abiItem)));
}
/**
* Throws when ambiguous types are found on overloaded ABI items.
*
* @example
* ```ts twoslash
* import { Abi, AbiFunction } from 'ox'
*
* const foo = Abi.from(['function foo(address)', 'function foo(bytes20)'])
* AbiFunction.fromAbi(foo, 'foo', {
*   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
* })
* // @error: AbiItem.AmbiguityError: Found ambiguous types in overloaded ABI Items.
* // @error: `bytes20` in `foo(bytes20)`, and
* // @error: `address` in `foo(address)`
* // @error: These types encode differently and cannot be distinguished at runtime.
* // @error: Remove one of the ambiguous items in the ABI.
* ```
*
* ### Solution
*
* Remove one of the ambiguous types from the ABI.
*
* ```ts twoslash
* import { Abi, AbiFunction } from 'ox'
*
* const foo = Abi.from([
*   'function foo(address)',
*   'function foo(bytes20)' // [!code --]
* ])
* AbiFunction.fromAbi(foo, 'foo', {
*   args: ['0xA0Cf798816D4b9b9866b5330EEa46a18382f251e'],
* })
* // @error: AbiItem.AmbiguityError: Found ambiguous types in overloaded ABI Items.
* // @error: `bytes20` in `foo(bytes20)`, and
* // @error: `address` in `foo(address)`
* // @error: These types encode differently and cannot be distinguished at runtime.
* // @error: Remove one of the ambiguous items in the ABI.
* ```
*/
var AmbiguityError = class extends BaseError {
	constructor(x, y) {
		super("Found ambiguous types in overloaded ABI Items.", { metaMessages: [
			`\`${x.type}\` in \`${normalizeSignature(formatAbiItem(x.abiItem))}\`, and`,
			`\`${y.type}\` in \`${normalizeSignature(formatAbiItem(y.abiItem))}\``,
			"",
			"These types encode differently and cannot be distinguished at runtime.",
			"Remove one of the ambiguous items in the ABI."
		] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiItem.AmbiguityError"
		});
	}
};
/**
* Throws when an ABI item is not found in the ABI.
*
* @example
* ```ts twoslash
* // @noErrors
* import { Abi, AbiFunction } from 'ox'
*
* const foo = Abi.from([
*   'function foo(address)',
*   'function bar(uint)'
* ])
* AbiFunction.fromAbi(foo, 'baz')
* // @error: AbiItem.NotFoundError: ABI function with name "baz" not found.
* ```
*
* ### Solution
*
* Ensure the ABI item exists on the ABI.
*
* ```ts twoslash
* // @noErrors
* import { Abi, AbiFunction } from 'ox'
*
* const foo = Abi.from([
*   'function foo(address)',
*   'function bar(uint)',
*   'function baz(bool)' // [!code ++]
* ])
* AbiFunction.fromAbi(foo, 'baz')
* ```
*/
var NotFoundError = class extends BaseError {
	constructor({ name, data, type = "item" }) {
		const selector = (() => {
			if (name) return ` with name "${name}"`;
			if (data) return ` with data "${data}"`;
			return "";
		})();
		super(`ABI ${type}${selector} not found.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiItem.NotFoundError"
		});
	}
};
//#endregion
//#region node_modules/ox/_esm/core/AbiConstructor.js
function encode(...parameters) {
	const [abiConstructor, options] = (() => {
		if (Array.isArray(parameters[0])) {
			const [abi, options] = parameters;
			return [fromAbi$1(abi), options];
		}
		return parameters;
	})();
	const { bytecode, args } = options;
	return concat(bytecode, abiConstructor.inputs?.length && args?.length ? encode$1(abiConstructor.inputs, args) : "0x");
}
/** @internal */
function from$2(abiConstructor) {
	return from$3(abiConstructor);
}
/** @internal */
function fromAbi$1(abi) {
	const item = abi.find((item) => item.type === "constructor");
	if (!item) throw new NotFoundError({ name: "constructor" });
	return item;
}
/**
* Parses an arbitrary **JSON ABI Event** or **Human Readable ABI Event** into a typed {@link ox#AbiEvent.AbiEvent}.
*
* @example
* ### JSON ABIs
*
* ```ts twoslash
* import { AbiEvent } from 'ox'
*
* const transfer = AbiEvent.from({
*   name: 'Transfer',
*   type: 'event',
*   inputs: [
*     { name: 'from', type: 'address', indexed: true },
*     { name: 'to', type: 'address', indexed: true },
*     { name: 'value', type: 'uint256' },
*   ],
* })
*
* transfer
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
* @example
* ### Human Readable ABIs
*
* A Human Readable ABI can be parsed into a typed ABI object:
*
* ```ts twoslash
* import { AbiEvent } from 'ox'
*
* const transfer = AbiEvent.from(
*   'event Transfer(address indexed from, address indexed to, uint256 value)' // [!code hl]
* )
*
* transfer
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
* @param abiEvent - The ABI Event to parse.
* @returns Typed ABI Event.
*/
function from$1(abiEvent, options = {}) {
	return from$3(abiEvent, options);
}
/**
* Computes the event selector (hash of event signature) for an {@link ox#AbiEvent.AbiEvent}.
*
* @example
* ```ts twoslash
* import { AbiEvent } from 'ox'
*
* const selector = AbiEvent.getSelector('event Transfer(address indexed from, address indexed to, uint256 value)')
* // @log: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f556a2'
* ```
*
* @example
* ```ts twoslash
* import { AbiEvent } from 'ox'
*
* const selector = AbiEvent.getSelector({
*   name: 'Transfer',
*   type: 'event',
*   inputs: [
*     { name: 'from', type: 'address', indexed: true },
*     { name: 'to', type: 'address', indexed: true },
*     { name: 'value', type: 'uint256' }
*   ]
* })
* // @log: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f556a2'
* ```
*
* @param abiItem - The ABI event to compute the selector for.
* @returns The {@link ox#Hash.(keccak256:function)} hash of the event signature.
*/
function getSelector$1(abiItem) {
	return getSignatureHash(abiItem);
}
//#endregion
//#region node_modules/ox/_esm/core/AbiFunction.js
function decodeResult(...parameters) {
	const [abiFunction, data, options = {}] = (() => {
		if (Array.isArray(parameters[0])) {
			const [abi, name, data, options] = parameters;
			return [
				fromAbi(abi, name),
				data,
				options
			];
		}
		return parameters;
	})();
	const values = decode(abiFunction.outputs, data, options);
	if (values && Object.keys(values).length === 0) return void 0;
	if (values && Object.keys(values).length === 1) {
		if (Array.isArray(values)) return values[0];
		return Object.values(values)[0];
	}
	return values;
}
function encodeData(...parameters) {
	const [abiFunction, args = []] = (() => {
		if (Array.isArray(parameters[0])) {
			const [abi, name, args] = parameters;
			return [fromAbi(abi, name, { args }), args];
		}
		const [abiFunction, args] = parameters;
		return [abiFunction, args];
	})();
	const { overloads } = abiFunction;
	const item = overloads ? fromAbi([abiFunction, ...overloads], abiFunction.name, { args }) : abiFunction;
	const selector = getSelector(item);
	const data = args.length > 0 ? encode$1(item.inputs, args) : void 0;
	return data ? concat(selector, data) : selector;
}
/**
* Parses an arbitrary **JSON ABI Function** or **Human Readable ABI Function** into a typed {@link ox#AbiFunction.AbiFunction}.
*
* @example
* ### JSON ABIs
*
* ```ts twoslash
* import { AbiFunction } from 'ox'
*
* const approve = AbiFunction.from({
*   type: 'function',
*   name: 'approve',
*   stateMutability: 'nonpayable',
*   inputs: [
*     {
*       name: 'spender',
*       type: 'address',
*     },
*     {
*       name: 'amount',
*       type: 'uint256',
*     },
*   ],
*   outputs: [{ type: 'bool' }],
* })
*
* approve
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
* @example
* ### Human Readable ABIs
*
* A Human Readable ABI can be parsed into a typed ABI object:
*
* ```ts twoslash
* import { AbiFunction } from 'ox'
*
* const approve = AbiFunction.from(
*   'function approve(address spender, uint256 amount) returns (bool)' // [!code hl]
* )
*
* approve
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
* @example
* It is possible to specify `struct`s along with your definitions:
*
* ```ts twoslash
* import { AbiFunction } from 'ox'
*
* const approve = AbiFunction.from([
*   'struct Foo { address spender; uint256 amount; }', // [!code hl]
*   'function approve(Foo foo) returns (bool)',
* ])
*
* approve
* //^?
*
*
*
*
*
*
*
*
*
*
*
*
* ```
*
*
*
* @param abiFunction - The ABI Function to parse.
* @returns Typed ABI Function.
*/
function from(abiFunction, options = {}) {
	return from$3(abiFunction, options);
}
/**
* Extracts an {@link ox#AbiFunction.AbiFunction} from an {@link ox#Abi.Abi} given a name and optional arguments.
*
* @example
* ### Extracting by Name
*
* ABI Functions can be extracted by their name using the `name` option:
*
* ```ts twoslash
* import { Abi, AbiFunction } from 'ox'
*
* const abi = Abi.from([
*   'function foo()',
*   'event Transfer(address owner, address to, uint256 tokenId)',
*   'function bar(string a) returns (uint256 x)',
* ])
*
* const item = AbiFunction.fromAbi(abi, 'foo') // [!code focus]
* //    ^?
*
*
*
*
*
*
* ```
*
* @example
* ### Extracting by Selector
*
* ABI Functions can be extract by their selector when {@link ox#Hex.Hex} is provided to `name`.
*
* ```ts twoslash
* import { Abi, AbiFunction } from 'ox'
*
* const abi = Abi.from([
*   'function foo()',
*   'event Transfer(address owner, address to, uint256 tokenId)',
*   'function bar(string a) returns (uint256 x)',
* ])
* const item = AbiFunction.fromAbi(abi, '0x095ea7b3') // [!code focus]
* //    ^?
*
*
*
*
*
*
*
*
*
* ```
*
* :::note
*
* Extracting via a hex selector is useful when extracting an ABI Function from an `eth_call` RPC response or
* from a Transaction `input`.
*
* :::
*
* @param abi - The ABI to extract from.
* @param name - The name (or selector) of the ABI item to extract.
* @param options - Extraction options.
* @returns The ABI item.
*/
function fromAbi(abi, name, options) {
	const item = fromAbi$2(abi, name, options);
	if (item.type !== "function") throw new NotFoundError({
		name,
		type: "function"
	});
	return item;
}
/**
* Computes the [4-byte selector](https://solidity-by-example.org/function-selector/) for an {@link ox#AbiFunction.AbiFunction}.
*
* Useful for computing function selectors for calldata.
*
* @example
* ```ts twoslash
* import { AbiFunction } from 'ox'
*
* const selector = AbiFunction.getSelector('function ownerOf(uint256 tokenId)')
* // @log: '0x6352211e'
* ```
*
* @example
* ```ts twoslash
* import { AbiFunction } from 'ox'
*
* const selector = AbiFunction.getSelector({
*   inputs: [{ type: 'uint256' }],
*   name: 'ownerOf',
*   outputs: [],
*   stateMutability: 'view',
*   type: 'function'
* })
* // @log: '0x6352211e'
* ```
*
* @param abiItem - The ABI item to compute the selector for.
* @returns The first 4 bytes of the {@link ox#Hash.(keccak256:function)} hash of the function signature.
*/
function getSelector(abiItem) {
	return getSelector$2(abiItem);
}
//#endregion
//#region node_modules/ox/_esm/erc6492/SignatureErc6492.js
/**
* Magic bytes used to identify ERC-6492 wrapped signatures.
*/
var magicBytes = "0x6492649264926492649264926492649264926492649264926492649264926492";
/**
* Asserts that the wrapped signature is valid.
*
* @example
* ```ts twoslash
* import { SignatureErc6492 } from 'ox/erc6492'
*
* SignatureErc6492.assert('0xdeadbeef')
* // @error: InvalidWrappedSignatureError: Value `0xdeadbeef` is an invalid ERC-6492 wrapped signature.
* ```
*
* @param wrapped - The wrapped signature to assert.
*/
function assert(wrapped) {
	if (slice(wrapped, -32) !== "0x6492649264926492649264926492649264926492649264926492649264926492") throw new InvalidWrappedSignatureError(wrapped);
}
/**
* Serializes an [ERC-6492 wrapped signature](https://eips.ethereum.org/EIPS/eip-6492#specification).
*
* @example
* ```ts twoslash
* import { Secp256k1, Signature } from 'ox'
* import { SignatureErc6492 } from 'ox/erc6492' // [!code focus]
*
* const signature = Secp256k1.sign({
*   payload: '0x...',
*   privateKey: '0x...',
* })
*
* const wrapped = SignatureErc6492.wrap({ // [!code focus]
*   data: '0xdeadbeef', // [!code focus]
*   signature: Signature.toHex(signature), // [!code focus]
*   to: '0x00000000219ab540356cBB839Cbe05303d7705Fa', // [!code focus]
* }) // [!code focus]
* ```
*
* @param value - Wrapped signature to serialize.
* @returns Serialized wrapped signature.
*/
function wrap(value) {
	const { data, signature, to } = value;
	return concat(encode$1(from$6("address, bytes, bytes"), [
		to,
		data,
		signature
	]), magicBytes);
}
/**
* Validates a wrapped signature. Returns `true` if the wrapped signature is valid, `false` otherwise.
*
* @example
* ```ts twoslash
* import { SignatureErc6492 } from 'ox/erc6492'
*
* const valid = SignatureErc6492.validate('0xdeadbeef')
* // @log: false
* ```
*
* @param wrapped - The wrapped signature to validate.
* @returns `true` if the wrapped signature is valid, `false` otherwise.
*/
function validate(wrapped) {
	try {
		assert(wrapped);
		return true;
	} catch {
		return false;
	}
}
/** Thrown when the ERC-6492 wrapped signature is invalid. */
var InvalidWrappedSignatureError = class extends BaseError {
	constructor(wrapped) {
		super(`Value \`${wrapped}\` is an invalid ERC-6492 wrapped signature.`);
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "SignatureErc6492.InvalidWrappedSignatureError"
		});
	}
};
//#endregion
export { from as a, encode as c, validate$1 as d, toRpc as f, encodeData as i, from$2 as l, wrap as n, from$1 as o, decodeResult as r, getSelector$1 as s, validate as t, unwrap as u };
