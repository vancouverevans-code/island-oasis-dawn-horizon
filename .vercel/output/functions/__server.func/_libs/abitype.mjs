//#region node_modules/abitype/dist/esm/version.js
var version = "1.2.3";
//#endregion
//#region node_modules/abitype/dist/esm/errors.js
var BaseError = class BaseError extends Error {
	constructor(shortMessage, args = {}) {
		const details = args.cause instanceof BaseError ? args.cause.details : args.cause?.message ? args.cause.message : args.details;
		const docsPath = args.cause instanceof BaseError ? args.cause.docsPath || args.docsPath : args.docsPath;
		const message = [
			shortMessage || "An error occurred.",
			"",
			...args.metaMessages ? [...args.metaMessages, ""] : [],
			...docsPath ? [`Docs: https://abitype.dev${docsPath}`] : [],
			...details ? [`Details: ${details}`] : [],
			`Version: abitype@${version}`
		].join("\n");
		super(message);
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
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "AbiTypeError"
		});
		if (args.cause) this.cause = args.cause;
		this.details = details;
		this.docsPath = docsPath;
		this.metaMessages = args.metaMessages;
		this.shortMessage = shortMessage;
	}
};
//#endregion
//#region node_modules/abitype/dist/esm/regex.js
function execTyped(regex, string) {
	return regex.exec(string)?.groups;
}
var bytesRegex = /^bytes([1-9]|1[0-9]|2[0-9]|3[0-2])?$/;
var integerRegex = /^u?int(8|16|24|32|40|48|56|64|72|80|88|96|104|112|120|128|136|144|152|160|168|176|184|192|200|208|216|224|232|240|248|256)?$/;
var isTupleRegex = /^\(.+?\).*?$/;
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/formatAbiParameter.js
var tupleRegex = /^tuple(?<array>(\[(\d*)\])*)$/;
/**
* Formats {@link AbiParameter} to human-readable ABI parameter.
*
* @param abiParameter - ABI parameter
* @returns Human-readable ABI parameter
*
* @example
* const result = formatAbiParameter({ type: 'address', name: 'from' })
* //    ^? const result: 'address from'
*/
function formatAbiParameter(abiParameter) {
	let type = abiParameter.type;
	if (tupleRegex.test(abiParameter.type) && "components" in abiParameter) {
		type = "(";
		const length = abiParameter.components.length;
		for (let i = 0; i < length; i++) {
			const component = abiParameter.components[i];
			type += formatAbiParameter(component);
			if (i < length - 1) type += ", ";
		}
		const result = execTyped(tupleRegex, abiParameter.type);
		type += `)${result?.array || ""}`;
		return formatAbiParameter({
			...abiParameter,
			type
		});
	}
	if ("indexed" in abiParameter && abiParameter.indexed) type = `${type} indexed`;
	if (abiParameter.name) return `${type} ${abiParameter.name}`;
	return type;
}
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/formatAbiParameters.js
/**
* Formats {@link AbiParameter}s to human-readable ABI parameters.
*
* @param abiParameters - ABI parameters
* @returns Human-readable ABI parameters
*
* @example
* const result = formatAbiParameters([
*   //  ^? const result: 'address from, uint256 tokenId'
*   { type: 'address', name: 'from' },
*   { type: 'uint256', name: 'tokenId' },
* ])
*/
function formatAbiParameters(abiParameters) {
	let params = "";
	const length = abiParameters.length;
	for (let i = 0; i < length; i++) {
		const abiParameter = abiParameters[i];
		params += formatAbiParameter(abiParameter);
		if (i !== length - 1) params += ", ";
	}
	return params;
}
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/formatAbiItem.js
/**
* Formats ABI item (e.g. error, event, function) into human-readable ABI item
*
* @param abiItem - ABI item
* @returns Human-readable ABI item
*/
function formatAbiItem(abiItem) {
	if (abiItem.type === "function") return `function ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability && abiItem.stateMutability !== "nonpayable" ? ` ${abiItem.stateMutability}` : ""}${abiItem.outputs?.length ? ` returns (${formatAbiParameters(abiItem.outputs)})` : ""}`;
	if (abiItem.type === "event") return `event ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
	if (abiItem.type === "error") return `error ${abiItem.name}(${formatAbiParameters(abiItem.inputs)})`;
	if (abiItem.type === "constructor") return `constructor(${formatAbiParameters(abiItem.inputs)})${abiItem.stateMutability === "payable" ? " payable" : ""}`;
	if (abiItem.type === "fallback") return `fallback() external${abiItem.stateMutability === "payable" ? " payable" : ""}`;
	return "receive() external payable";
}
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/runtime/signatures.js
var errorSignatureRegex = /^error (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
function isErrorSignature(signature) {
	return errorSignatureRegex.test(signature);
}
function execErrorSignature(signature) {
	return execTyped(errorSignatureRegex, signature);
}
var eventSignatureRegex = /^event (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)$/;
function isEventSignature(signature) {
	return eventSignatureRegex.test(signature);
}
function execEventSignature(signature) {
	return execTyped(eventSignatureRegex, signature);
}
var functionSignatureRegex = /^function (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*)\((?<parameters>.*?)\)(?: (?<scope>external|public{1}))?(?: (?<stateMutability>pure|view|nonpayable|payable{1}))?(?: returns\s?\((?<returns>.*?)\))?$/;
function isFunctionSignature(signature) {
	return functionSignatureRegex.test(signature);
}
function execFunctionSignature(signature) {
	return execTyped(functionSignatureRegex, signature);
}
var structSignatureRegex = /^struct (?<name>[a-zA-Z$_][a-zA-Z0-9$_]*) \{(?<properties>.*?)\}$/;
function isStructSignature(signature) {
	return structSignatureRegex.test(signature);
}
function execStructSignature(signature) {
	return execTyped(structSignatureRegex, signature);
}
var constructorSignatureRegex = /^constructor\((?<parameters>.*?)\)(?:\s(?<stateMutability>payable{1}))?$/;
function isConstructorSignature(signature) {
	return constructorSignatureRegex.test(signature);
}
function execConstructorSignature(signature) {
	return execTyped(constructorSignatureRegex, signature);
}
var fallbackSignatureRegex = /^fallback\(\) external(?:\s(?<stateMutability>payable{1}))?$/;
function isFallbackSignature(signature) {
	return fallbackSignatureRegex.test(signature);
}
function execFallbackSignature(signature) {
	return execTyped(fallbackSignatureRegex, signature);
}
var receiveSignatureRegex = /^receive\(\) external payable$/;
function isReceiveSignature(signature) {
	return receiveSignatureRegex.test(signature);
}
var modifiers = /* @__PURE__ */ new Set([
	"memory",
	"indexed",
	"storage",
	"calldata"
]);
var eventModifiers = /* @__PURE__ */ new Set(["indexed"]);
var functionModifiers = /* @__PURE__ */ new Set([
	"calldata",
	"memory",
	"storage"
]);
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/errors/abiItem.js
var InvalidAbiItemError = class extends BaseError {
	constructor({ signature }) {
		super("Failed to parse ABI item.", {
			details: `parseAbiItem(${JSON.stringify(signature, null, 2)})`,
			docsPath: "/api/human#parseabiitem-1"
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidAbiItemError"
		});
	}
};
var UnknownTypeError = class extends BaseError {
	constructor({ type }) {
		super("Unknown type.", { metaMessages: [`Type "${type}" is not a valid ABI type. Perhaps you forgot to include a struct signature?`] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "UnknownTypeError"
		});
	}
};
var UnknownSolidityTypeError = class extends BaseError {
	constructor({ type }) {
		super("Unknown type.", { metaMessages: [`Type "${type}" is not a valid ABI type.`] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "UnknownSolidityTypeError"
		});
	}
};
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/errors/abiParameter.js
var InvalidAbiParametersError = class extends BaseError {
	constructor({ params }) {
		super("Failed to parse ABI parameters.", {
			details: `parseAbiParameters(${JSON.stringify(params, null, 2)})`,
			docsPath: "/api/human#parseabiparameters-1"
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidAbiParametersError"
		});
	}
};
var InvalidParameterError = class extends BaseError {
	constructor({ param }) {
		super("Invalid ABI parameter.", { details: param });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidParameterError"
		});
	}
};
var SolidityProtectedKeywordError = class extends BaseError {
	constructor({ param, name }) {
		super("Invalid ABI parameter.", {
			details: param,
			metaMessages: [`"${name}" is a protected Solidity keyword. More info: https://docs.soliditylang.org/en/latest/cheatsheet.html`]
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "SolidityProtectedKeywordError"
		});
	}
};
var InvalidModifierError = class extends BaseError {
	constructor({ param, type, modifier }) {
		super("Invalid ABI parameter.", {
			details: param,
			metaMessages: [`Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`]
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidModifierError"
		});
	}
};
var InvalidFunctionModifierError = class extends BaseError {
	constructor({ param, type, modifier }) {
		super("Invalid ABI parameter.", {
			details: param,
			metaMessages: [`Modifier "${modifier}" not allowed${type ? ` in "${type}" type` : ""}.`, `Data location can only be specified for array, struct, or mapping types, but "${modifier}" was given.`]
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidFunctionModifierError"
		});
	}
};
var InvalidAbiTypeParameterError = class extends BaseError {
	constructor({ abiParameter }) {
		super("Invalid ABI parameter.", {
			details: JSON.stringify(abiParameter, null, 2),
			metaMessages: ["ABI parameter type is invalid."]
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidAbiTypeParameterError"
		});
	}
};
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/errors/signature.js
var InvalidSignatureError = class extends BaseError {
	constructor({ signature, type }) {
		super(`Invalid ${type} signature.`, { details: signature });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidSignatureError"
		});
	}
};
var UnknownSignatureError = class extends BaseError {
	constructor({ signature }) {
		super("Unknown signature.", { details: signature });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "UnknownSignatureError"
		});
	}
};
var InvalidStructSignatureError = class extends BaseError {
	constructor({ signature }) {
		super("Invalid struct signature.", {
			details: signature,
			metaMessages: ["No properties exist."]
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidStructSignatureError"
		});
	}
};
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/errors/struct.js
var CircularReferenceError = class extends BaseError {
	constructor({ type }) {
		super("Circular reference detected.", { metaMessages: [`Struct "${type}" is a circular reference.`] });
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "CircularReferenceError"
		});
	}
};
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/errors/splitParameters.js
var InvalidParenthesisError = class extends BaseError {
	constructor({ current, depth }) {
		super("Unbalanced parentheses.", {
			metaMessages: [`"${current.trim()}" has too many ${depth > 0 ? "opening" : "closing"} parentheses.`],
			details: `Depth "${depth}"`
		});
		Object.defineProperty(this, "name", {
			enumerable: true,
			configurable: true,
			writable: true,
			value: "InvalidParenthesisError"
		});
	}
};
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/runtime/cache.js
/**
* Gets {@link parameterCache} cache key namespaced by {@link type} and {@link structs}. This prevents parameters from being accessible to types that don't allow them (e.g. `string indexed foo` not allowed outside of `type: 'event'`) and ensures different struct definitions with the same name are cached separately.
* @param param ABI parameter string
* @param type ABI parameter type
* @param structs Struct definitions to include in cache key
* @returns Cache key for {@link parameterCache}
*/
function getParameterCacheKey(param, type, structs) {
	let structKey = "";
	if (structs) for (const struct of Object.entries(structs)) {
		if (!struct) continue;
		let propertyKey = "";
		for (const property of struct[1]) propertyKey += `[${property.type}${property.name ? `:${property.name}` : ""}]`;
		structKey += `(${struct[0]}{${propertyKey}})`;
	}
	if (type) return `${type}:${param}${structKey}`;
	return `${param}${structKey}`;
}
/**
* Basic cache seeded with common ABI parameter strings.
*
* **Note: When seeding more parameters, make sure you benchmark performance. The current number is the ideal balance between performance and having an already existing cache.**
*/
var parameterCache = /* @__PURE__ */ new Map([
	["address", { type: "address" }],
	["bool", { type: "bool" }],
	["bytes", { type: "bytes" }],
	["bytes32", { type: "bytes32" }],
	["int", { type: "int256" }],
	["int256", { type: "int256" }],
	["string", { type: "string" }],
	["uint", { type: "uint256" }],
	["uint8", { type: "uint8" }],
	["uint16", { type: "uint16" }],
	["uint24", { type: "uint24" }],
	["uint32", { type: "uint32" }],
	["uint64", { type: "uint64" }],
	["uint96", { type: "uint96" }],
	["uint112", { type: "uint112" }],
	["uint160", { type: "uint160" }],
	["uint192", { type: "uint192" }],
	["uint256", { type: "uint256" }],
	["address owner", {
		type: "address",
		name: "owner"
	}],
	["address to", {
		type: "address",
		name: "to"
	}],
	["bool approved", {
		type: "bool",
		name: "approved"
	}],
	["bytes _data", {
		type: "bytes",
		name: "_data"
	}],
	["bytes data", {
		type: "bytes",
		name: "data"
	}],
	["bytes signature", {
		type: "bytes",
		name: "signature"
	}],
	["bytes32 hash", {
		type: "bytes32",
		name: "hash"
	}],
	["bytes32 r", {
		type: "bytes32",
		name: "r"
	}],
	["bytes32 root", {
		type: "bytes32",
		name: "root"
	}],
	["bytes32 s", {
		type: "bytes32",
		name: "s"
	}],
	["string name", {
		type: "string",
		name: "name"
	}],
	["string symbol", {
		type: "string",
		name: "symbol"
	}],
	["string tokenURI", {
		type: "string",
		name: "tokenURI"
	}],
	["uint tokenId", {
		type: "uint256",
		name: "tokenId"
	}],
	["uint8 v", {
		type: "uint8",
		name: "v"
	}],
	["uint256 balance", {
		type: "uint256",
		name: "balance"
	}],
	["uint256 tokenId", {
		type: "uint256",
		name: "tokenId"
	}],
	["uint256 value", {
		type: "uint256",
		name: "value"
	}],
	["event:address indexed from", {
		type: "address",
		name: "from",
		indexed: true
	}],
	["event:address indexed to", {
		type: "address",
		name: "to",
		indexed: true
	}],
	["event:uint indexed tokenId", {
		type: "uint256",
		name: "tokenId",
		indexed: true
	}],
	["event:uint256 indexed tokenId", {
		type: "uint256",
		name: "tokenId",
		indexed: true
	}]
]);
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/runtime/utils.js
function parseSignature(signature, structs = {}) {
	if (isFunctionSignature(signature)) return parseFunctionSignature(signature, structs);
	if (isEventSignature(signature)) return parseEventSignature(signature, structs);
	if (isErrorSignature(signature)) return parseErrorSignature(signature, structs);
	if (isConstructorSignature(signature)) return parseConstructorSignature(signature, structs);
	if (isFallbackSignature(signature)) return parseFallbackSignature(signature);
	if (isReceiveSignature(signature)) return {
		type: "receive",
		stateMutability: "payable"
	};
	throw new UnknownSignatureError({ signature });
}
function parseFunctionSignature(signature, structs = {}) {
	const match = execFunctionSignature(signature);
	if (!match) throw new InvalidSignatureError({
		signature,
		type: "function"
	});
	const inputParams = splitParameters(match.parameters);
	const inputs = [];
	const inputLength = inputParams.length;
	for (let i = 0; i < inputLength; i++) inputs.push(parseAbiParameter(inputParams[i], {
		modifiers: functionModifiers,
		structs,
		type: "function"
	}));
	const outputs = [];
	if (match.returns) {
		const outputParams = splitParameters(match.returns);
		const outputLength = outputParams.length;
		for (let i = 0; i < outputLength; i++) outputs.push(parseAbiParameter(outputParams[i], {
			modifiers: functionModifiers,
			structs,
			type: "function"
		}));
	}
	return {
		name: match.name,
		type: "function",
		stateMutability: match.stateMutability ?? "nonpayable",
		inputs,
		outputs
	};
}
function parseEventSignature(signature, structs = {}) {
	const match = execEventSignature(signature);
	if (!match) throw new InvalidSignatureError({
		signature,
		type: "event"
	});
	const params = splitParameters(match.parameters);
	const abiParameters = [];
	const length = params.length;
	for (let i = 0; i < length; i++) abiParameters.push(parseAbiParameter(params[i], {
		modifiers: eventModifiers,
		structs,
		type: "event"
	}));
	return {
		name: match.name,
		type: "event",
		inputs: abiParameters
	};
}
function parseErrorSignature(signature, structs = {}) {
	const match = execErrorSignature(signature);
	if (!match) throw new InvalidSignatureError({
		signature,
		type: "error"
	});
	const params = splitParameters(match.parameters);
	const abiParameters = [];
	const length = params.length;
	for (let i = 0; i < length; i++) abiParameters.push(parseAbiParameter(params[i], {
		structs,
		type: "error"
	}));
	return {
		name: match.name,
		type: "error",
		inputs: abiParameters
	};
}
function parseConstructorSignature(signature, structs = {}) {
	const match = execConstructorSignature(signature);
	if (!match) throw new InvalidSignatureError({
		signature,
		type: "constructor"
	});
	const params = splitParameters(match.parameters);
	const abiParameters = [];
	const length = params.length;
	for (let i = 0; i < length; i++) abiParameters.push(parseAbiParameter(params[i], {
		structs,
		type: "constructor"
	}));
	return {
		type: "constructor",
		stateMutability: match.stateMutability ?? "nonpayable",
		inputs: abiParameters
	};
}
function parseFallbackSignature(signature) {
	const match = execFallbackSignature(signature);
	if (!match) throw new InvalidSignatureError({
		signature,
		type: "fallback"
	});
	return {
		type: "fallback",
		stateMutability: match.stateMutability ?? "nonpayable"
	};
}
var abiParameterWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*(?:\spayable)?)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
var abiParameterWithTupleRegex = /^\((?<type>.+?)\)(?<array>(?:\[\d*?\])+?)?(?:\s(?<modifier>calldata|indexed|memory|storage{1}))?(?:\s(?<name>[a-zA-Z$_][a-zA-Z0-9$_]*))?$/;
var dynamicIntegerRegex = /^u?int$/;
function parseAbiParameter(param, options) {
	const parameterCacheKey = getParameterCacheKey(param, options?.type, options?.structs);
	if (parameterCache.has(parameterCacheKey)) return parameterCache.get(parameterCacheKey);
	const isTuple = isTupleRegex.test(param);
	const match = execTyped(isTuple ? abiParameterWithTupleRegex : abiParameterWithoutTupleRegex, param);
	if (!match) throw new InvalidParameterError({ param });
	if (match.name && isSolidityKeyword(match.name)) throw new SolidityProtectedKeywordError({
		param,
		name: match.name
	});
	const name = match.name ? { name: match.name } : {};
	const indexed = match.modifier === "indexed" ? { indexed: true } : {};
	const structs = options?.structs ?? {};
	let type;
	let components = {};
	if (isTuple) {
		type = "tuple";
		const params = splitParameters(match.type);
		const components_ = [];
		const length = params.length;
		for (let i = 0; i < length; i++) components_.push(parseAbiParameter(params[i], { structs }));
		components = { components: components_ };
	} else if (match.type in structs) {
		type = "tuple";
		components = { components: structs[match.type] };
	} else if (dynamicIntegerRegex.test(match.type)) type = `${match.type}256`;
	else if (match.type === "address payable") type = "address";
	else {
		type = match.type;
		if (!(options?.type === "struct") && !isSolidityType(type)) throw new UnknownSolidityTypeError({ type });
	}
	if (match.modifier) {
		if (!options?.modifiers?.has?.(match.modifier)) throw new InvalidModifierError({
			param,
			type: options?.type,
			modifier: match.modifier
		});
		if (functionModifiers.has(match.modifier) && !isValidDataLocation(type, !!match.array)) throw new InvalidFunctionModifierError({
			param,
			type: options?.type,
			modifier: match.modifier
		});
	}
	const abiParameter = {
		type: `${type}${match.array ?? ""}`,
		...name,
		...indexed,
		...components
	};
	parameterCache.set(parameterCacheKey, abiParameter);
	return abiParameter;
}
function splitParameters(params, result = [], current = "", depth = 0) {
	const length = params.trim().length;
	for (let i = 0; i < length; i++) {
		const char = params[i];
		const tail = params.slice(i + 1);
		switch (char) {
			case ",": return depth === 0 ? splitParameters(tail, [...result, current.trim()]) : splitParameters(tail, result, `${current}${char}`, depth);
			case "(": return splitParameters(tail, result, `${current}${char}`, depth + 1);
			case ")": return splitParameters(tail, result, `${current}${char}`, depth - 1);
			default: return splitParameters(tail, result, `${current}${char}`, depth);
		}
	}
	if (current === "") return result;
	if (depth !== 0) throw new InvalidParenthesisError({
		current,
		depth
	});
	result.push(current.trim());
	return result;
}
function isSolidityType(type) {
	return type === "address" || type === "bool" || type === "function" || type === "string" || bytesRegex.test(type) || integerRegex.test(type);
}
var protectedKeywordsRegex = /^(?:after|alias|anonymous|apply|auto|byte|calldata|case|catch|constant|copyof|default|defined|error|event|external|false|final|function|immutable|implements|in|indexed|inline|internal|let|mapping|match|memory|mutable|null|of|override|partial|private|promise|public|pure|reference|relocatable|return|returns|sizeof|static|storage|struct|super|supports|switch|this|true|try|typedef|typeof|var|view|virtual)$/;
/** @internal */
function isSolidityKeyword(name) {
	return name === "address" || name === "bool" || name === "function" || name === "string" || name === "tuple" || bytesRegex.test(name) || integerRegex.test(name) || protectedKeywordsRegex.test(name);
}
/** @internal */
function isValidDataLocation(type, isArray) {
	return isArray || type === "bytes" || type === "string" || type === "tuple";
}
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/runtime/structs.js
function parseStructs(signatures) {
	const shallowStructs = {};
	const signaturesLength = signatures.length;
	for (let i = 0; i < signaturesLength; i++) {
		const signature = signatures[i];
		if (!isStructSignature(signature)) continue;
		const match = execStructSignature(signature);
		if (!match) throw new InvalidSignatureError({
			signature,
			type: "struct"
		});
		const properties = match.properties.split(";");
		const components = [];
		const propertiesLength = properties.length;
		for (let k = 0; k < propertiesLength; k++) {
			const trimmed = properties[k].trim();
			if (!trimmed) continue;
			const abiParameter = parseAbiParameter(trimmed, { type: "struct" });
			components.push(abiParameter);
		}
		if (!components.length) throw new InvalidStructSignatureError({ signature });
		shallowStructs[match.name] = components;
	}
	const resolvedStructs = {};
	const entries = Object.entries(shallowStructs);
	const entriesLength = entries.length;
	for (let i = 0; i < entriesLength; i++) {
		const [name, parameters] = entries[i];
		resolvedStructs[name] = resolveStructs(parameters, shallowStructs);
	}
	return resolvedStructs;
}
var typeWithoutTupleRegex = /^(?<type>[a-zA-Z$_][a-zA-Z0-9$_]*)(?<array>(?:\[\d*?\])+?)?$/;
function resolveStructs(abiParameters = [], structs = {}, ancestors = /* @__PURE__ */ new Set()) {
	const components = [];
	const length = abiParameters.length;
	for (let i = 0; i < length; i++) {
		const abiParameter = abiParameters[i];
		if (isTupleRegex.test(abiParameter.type)) components.push(abiParameter);
		else {
			const match = execTyped(typeWithoutTupleRegex, abiParameter.type);
			if (!match?.type) throw new InvalidAbiTypeParameterError({ abiParameter });
			const { array, type } = match;
			if (type in structs) {
				if (ancestors.has(type)) throw new CircularReferenceError({ type });
				components.push({
					...abiParameter,
					type: `tuple${array ?? ""}`,
					components: resolveStructs(structs[type], structs, /* @__PURE__ */ new Set([...ancestors, type]))
				});
			} else if (isSolidityType(type)) components.push(abiParameter);
			else throw new UnknownTypeError({ type });
		}
	}
	return components;
}
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/parseAbi.js
/**
* Parses human-readable ABI into JSON {@link Abi}
*
* @param signatures - Human-Readable ABI
* @returns Parsed {@link Abi}
*
* @example
* const abi = parseAbi([
*   //  ^? const abi: readonly [{ name: "balanceOf"; type: "function"; stateMutability:...
*   'function balanceOf(address owner) view returns (uint256)',
*   'event Transfer(address indexed from, address indexed to, uint256 amount)',
* ])
*/
function parseAbi(signatures) {
	const structs = parseStructs(signatures);
	const abi = [];
	const length = signatures.length;
	for (let i = 0; i < length; i++) {
		const signature = signatures[i];
		if (isStructSignature(signature)) continue;
		abi.push(parseSignature(signature, structs));
	}
	return abi;
}
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/parseAbiItem.js
/**
* Parses human-readable ABI item (e.g. error, event, function) into {@link Abi} item
*
* @param signature - Human-readable ABI item
* @returns Parsed {@link Abi} item
*
* @example
* const abiItem = parseAbiItem('function balanceOf(address owner) view returns (uint256)')
* //    ^? const abiItem: { name: "balanceOf"; type: "function"; stateMutability: "view";...
*
* @example
* const abiItem = parseAbiItem([
*   //  ^? const abiItem: { name: "foo"; type: "function"; stateMutability: "view"; inputs:...
*   'function foo(Baz bar) view returns (string)',
*   'struct Baz { string name; }',
* ])
*/
function parseAbiItem(signature) {
	let abiItem;
	if (typeof signature === "string") abiItem = parseSignature(signature);
	else {
		const structs = parseStructs(signature);
		const length = signature.length;
		for (let i = 0; i < length; i++) {
			const signature_ = signature[i];
			if (isStructSignature(signature_)) continue;
			abiItem = parseSignature(signature_, structs);
			break;
		}
	}
	if (!abiItem) throw new InvalidAbiItemError({ signature });
	return abiItem;
}
//#endregion
//#region node_modules/abitype/dist/esm/human-readable/parseAbiParameters.js
/**
* Parses human-readable ABI parameters into {@link AbiParameter}s
*
* @param params - Human-readable ABI parameters
* @returns Parsed {@link AbiParameter}s
*
* @example
* const abiParameters = parseAbiParameters('address from, address to, uint256 amount')
* //    ^? const abiParameters: [{ type: "address"; name: "from"; }, { type: "address";...
*
* @example
* const abiParameters = parseAbiParameters([
*   //  ^? const abiParameters: [{ type: "tuple"; components: [{ type: "string"; name:...
*   'Baz bar',
*   'struct Baz { string name; }',
* ])
*/
function parseAbiParameters(params) {
	const abiParameters = [];
	if (typeof params === "string") {
		const parameters = splitParameters(params);
		const length = parameters.length;
		for (let i = 0; i < length; i++) abiParameters.push(parseAbiParameter(parameters[i], { modifiers }));
	} else {
		const structs = parseStructs(params);
		const length = params.length;
		for (let i = 0; i < length; i++) {
			const signature = params[i];
			if (isStructSignature(signature)) continue;
			const parameters = splitParameters(signature);
			const length = parameters.length;
			for (let k = 0; k < length; k++) abiParameters.push(parseAbiParameter(parameters[k], {
				modifiers,
				structs
			}));
		}
	}
	if (abiParameters.length === 0) throw new InvalidAbiParametersError({ params });
	return abiParameters;
}
//#endregion
export { formatAbiParameters as a, formatAbiItem as i, parseAbiItem as n, parseAbi as r, parseAbiParameters as t };
