// biome-ignore-all lint: generated file
// biome-ignore-all assist: generated file
/* eslint-disable */
// @ts-ignore

/******************************************************************************
 *  GENERATED FILE, DO NOT MODIFY
 *  这是生成的文件，千万不要修改
 * 
 * @build-script/codegen - The Simple Code Generater
 * https://github.com/GongT/baobao
 * 
 ******************************************************************************/


export enum NodeErrorCode {
	/**
	 * <p>Used when an operation has been aborted (typically using an <code>AbortController</code>).</p>
	 * <p>APIs <em>not</em> using <code>AbortSignal</code>s typically do not raise an error with this code.</p>
	 * <p>This code does not use the regular <code>ERR_*</code> convention Node.js errors use in
	 * order to be compatible with the web platform's <code>AbortError</code>.</p>
	 * <p><a id="ERR_ACCESS_DENIED"></a></p>
	 */
	ABORT_ERR = 'ABORT_ERR',
	/**
	 * <p>A special type of error that is triggered whenever Node.js tries to get access
	 * to a resource restricted by the <a href="permissions.html#permission-model">Permission Model</a>.</p>
	 * <p><a id="ERR_AMBIGUOUS_ARGUMENT"></a></p>
	 */
	ERR_ACCESS_DENIED = 'ERR_ACCESS_DENIED',
	/**
	 * <p>A function argument is being used in a way that suggests that the function
	 * signature may be misunderstood. This is thrown by the <code>node:assert</code> module when
	 * the <code>message</code> parameter in <code>assert.throws(block, message)</code> matches the error
	 * message thrown by <code>block</code> because that usage suggests that the user believes
	 * <code>message</code> is the expected message rather than the message the <code>AssertionError</code>
	 * will display if <code>block</code> does not throw.</p>
	 * <p><a id="ERR_ARG_NOT_ITERABLE"></a></p>
	 */
	ERR_AMBIGUOUS_ARGUMENT = 'ERR_AMBIGUOUS_ARGUMENT',
	/**
	 * <p>An iterable argument (i.e. a value that works with <code>for...of</code> loops) was
	 * required, but not provided to a Node.js API.</p>
	 * <p><a id="ERR_ASSERTION"></a></p>
	 */
	ERR_ARG_NOT_ITERABLE = 'ERR_ARG_NOT_ITERABLE',
	/**
	 * <p>A special type of error that can be triggered whenever Node.js detects an
	 * exceptional logic violation that should never occur. These are raised typically
	 * by the <code>node:assert</code> module.</p>
	 * <p><a id="ERR_ASYNC_CALLBACK"></a></p>
	 */
	ERR_ASSERTION = 'ERR_ASSERTION',
	/**
	 * <p>An attempt was made to register something that is not a function as an
	 * <code>AsyncHooks</code> callback.</p>
	 * <p><a id="ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED"></a></p>
	 */
	ERR_ASYNC_CALLBACK = 'ERR_ASYNC_CALLBACK',
	/**
	 * <p>An operation related to module loading is customized by an asynchronous loader
	 * hook that never settled the promise before the loader thread exits.</p>
	 * <p><a id="ERR_ASYNC_TYPE"></a></p>
	 */
	ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED = 'ERR_ASYNC_LOADER_REQUEST_NEVER_SETTLED',
	/**
	 * <p>The type of an asynchronous resource was invalid. Users are also able
	 * to define their own types if using the public embedder API.</p>
	 * <p><a id="ERR_BROTLI_COMPRESSION_FAILED"></a></p>
	 */
	ERR_ASYNC_TYPE = 'ERR_ASYNC_TYPE',
	/**
	 * <p>Data passed to a Brotli stream was not successfully compressed.</p>
	 * <p><a id="ERR_BROTLI_INVALID_PARAM"></a></p>
	 */
	ERR_BROTLI_COMPRESSION_FAILED = 'ERR_BROTLI_COMPRESSION_FAILED',
	/**
	 * <p>An invalid parameter key was passed during construction of a Brotli stream.</p>
	 * <p><a id="ERR_BUFFER_CONTEXT_NOT_AVAILABLE"></a></p>
	 */
	ERR_BROTLI_INVALID_PARAM = 'ERR_BROTLI_INVALID_PARAM',
	/**
	 * <p>An attempt was made to create a Node.js <code>Buffer</code> instance from addon or embedder
	 * code, while in a JS engine Context that is not associated with a Node.js
	 * instance. The data passed to the <code>Buffer</code> method will have been released
	 * by the time the method returns.</p>
	 * <p>When encountering this error, a possible alternative to creating a <code>Buffer</code>
	 * instance is to create a normal <code>Uint8Array</code>, which only differs in the
	 * prototype of the resulting object. <code>Uint8Array</code>s are generally accepted in all
	 * Node.js core APIs where <code>Buffer</code>s are; they are available in all Contexts.</p>
	 * <p><a id="ERR_BUFFER_OUT_OF_BOUNDS"></a></p>
	 */
	ERR_BUFFER_CONTEXT_NOT_AVAILABLE = 'ERR_BUFFER_CONTEXT_NOT_AVAILABLE',
	/**
	 * <p>An operation outside the bounds of a <code>Buffer</code> was attempted.</p>
	 * <p><a id="ERR_BUFFER_TOO_LARGE"></a></p>
	 */
	ERR_BUFFER_OUT_OF_BOUNDS = 'ERR_BUFFER_OUT_OF_BOUNDS',
	/**
	 * <p>An attempt has been made to create a <code>Buffer</code> larger than the maximum allowed
	 * size.</p>
	 * <p><a id="ERR_CANNOT_WATCH_SIGINT"></a></p>
	 */
	ERR_BUFFER_TOO_LARGE = 'ERR_BUFFER_TOO_LARGE',
	/**
	 * <p>Node.js was unable to watch for the <code>SIGINT</code> signal.</p>
	 * <p><a id="ERR_CHILD_CLOSED_BEFORE_REPLY"></a></p>
	 */
	ERR_CANNOT_WATCH_SIGINT = 'ERR_CANNOT_WATCH_SIGINT',
	/**
	 * <p>A child process was closed before the parent received a reply.</p>
	 * <p><a id="ERR_CHILD_PROCESS_IPC_REQUIRED"></a></p>
	 */
	ERR_CHILD_CLOSED_BEFORE_REPLY = 'ERR_CHILD_CLOSED_BEFORE_REPLY',
	/**
	 * <p>Used when a child process is being forked without specifying an IPC channel.</p>
	 * <p><a id="ERR_CHILD_PROCESS_STDIO_MAXBUFFER"></a></p>
	 */
	ERR_CHILD_PROCESS_IPC_REQUIRED = 'ERR_CHILD_PROCESS_IPC_REQUIRED',
	/**
	 * <p>Used when the main process is trying to read data from the child process's
	 * STDERR/STDOUT, and the data's length is longer than the <code>maxBuffer</code> option.</p>
	 * <p><a id="ERR_CLOSED_MESSAGE_PORT"></a></p>
	 */
	ERR_CHILD_PROCESS_STDIO_MAXBUFFER = 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER',
	/**
	 * <p>There was an attempt to use a <code>MessagePort</code> instance in a closed
	 * state, usually after <code>.close()</code> has been called.</p>
	 * <p><a id="ERR_CONSOLE_WRITABLE_STREAM"></a></p>
	 */
	ERR_CLOSED_MESSAGE_PORT = 'ERR_CLOSED_MESSAGE_PORT',
	/**
	 * <p><code>Console</code> was instantiated without <code>stdout</code> stream, or <code>Console</code> has a
	 * non-writable <code>stdout</code> or <code>stderr</code> stream.</p>
	 * <p><a id="ERR_CONSTRUCT_CALL_INVALID"></a></p>
	 */
	ERR_CONSOLE_WRITABLE_STREAM = 'ERR_CONSOLE_WRITABLE_STREAM',
	/**
	 * <p>A class constructor was called that is not callable.</p>
	 * <p><a id="ERR_CONSTRUCT_CALL_REQUIRED"></a></p>
	 */
	ERR_CONSTRUCT_CALL_INVALID = 'ERR_CONSTRUCT_CALL_INVALID',
	/**
	 * <p>A constructor for a class was called without <code>new</code>.</p>
	 * <p><a id="ERR_CONTEXT_NOT_INITIALIZED"></a></p>
	 */
	ERR_CONSTRUCT_CALL_REQUIRED = 'ERR_CONSTRUCT_CALL_REQUIRED',
	/**
	 * <p>The vm context passed into the API is not yet initialized. This could happen
	 * when an error occurs (and is caught) during the creation of the
	 * context, for example, when the allocation fails or the maximum call stack
	 * size is reached when the context is created.</p>
	 * <p><a id="ERR_CPU_PROFILE_ALREADY_STARTED"></a></p>
	 */
	ERR_CONTEXT_NOT_INITIALIZED = 'ERR_CONTEXT_NOT_INITIALIZED',
	/**
	 * <p>The CPU profile with the given name is already started.</p>
	 * <p><a id="ERR_CPU_PROFILE_NOT_STARTED"></a></p>
	 */
	ERR_CPU_PROFILE_ALREADY_STARTED = 'ERR_CPU_PROFILE_ALREADY_STARTED',
	/**
	 * <p>The CPU profile with the given name is not started.</p>
	 * <p><a id="ERR_CPU_PROFILE_TOO_MANY"></a></p>
	 */
	ERR_CPU_PROFILE_NOT_STARTED = 'ERR_CPU_PROFILE_NOT_STARTED',
	/**
	 * <p>There are too many CPU profiles being collected.</p>
	 * <p><a id="ERR_CRYPTO_ARGON2_NOT_SUPPORTED"></a></p>
	 */
	ERR_CPU_PROFILE_TOO_MANY = 'ERR_CPU_PROFILE_TOO_MANY',
	/**
	 * <p>Argon2 is not supported by the current version of OpenSSL being used.</p>
	 * <p><a id="ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED"></a></p>
	 */
	ERR_CRYPTO_ARGON2_NOT_SUPPORTED = 'ERR_CRYPTO_ARGON2_NOT_SUPPORTED',
	/**
	 * <p>An OpenSSL engine was requested (for example, through the <code>clientCertEngine</code> or
	 * <code>privateKeyEngine</code> TLS options) that is not supported by the version of OpenSSL
	 * being used, likely due to the compile-time flag <code>OPENSSL_NO_ENGINE</code>.</p>
	 * <p><a id="ERR_CRYPTO_ECDH_INVALID_FORMAT"></a></p>
	 */
	ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED = 'ERR_CRYPTO_CUSTOM_ENGINE_NOT_SUPPORTED',
	/**
	 * <p>An invalid value for the <code>format</code> argument was passed to the <code>crypto.ECDH()</code>
	 * class <code>getPublicKey()</code> method.</p>
	 * <p><a id="ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY"></a></p>
	 */
	ERR_CRYPTO_ECDH_INVALID_FORMAT = 'ERR_CRYPTO_ECDH_INVALID_FORMAT',
	/**
	 * <p>An invalid value for the <code>key</code> argument has been passed to the
	 * <code>crypto.ECDH()</code> class <code>computeSecret()</code> method. It means that the public
	 * key lies outside of the elliptic curve.</p>
	 * <p><a id="ERR_CRYPTO_ENGINE_UNKNOWN"></a></p>
	 */
	ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY = 'ERR_CRYPTO_ECDH_INVALID_PUBLIC_KEY',
	/**
	 * <p>An invalid crypto engine identifier was passed to
	 * <a href="crypto.html#cryptosetengineengine-flags"><code>require('node:crypto').setEngine()</code></a>.</p>
	 * <p><a id="ERR_CRYPTO_FIPS_FORCED"></a></p>
	 */
	ERR_CRYPTO_ENGINE_UNKNOWN = 'ERR_CRYPTO_ENGINE_UNKNOWN',
	/**
	 * <p>The <a href="cli.html#--force-fips"><code>--force-fips</code></a> command-line argument was used but there was an attempt
	 * to enable or disable FIPS mode in the <code>node:crypto</code> module.</p>
	 * <p><a id="ERR_CRYPTO_FIPS_UNAVAILABLE"></a></p>
	 */
	ERR_CRYPTO_FIPS_FORCED = 'ERR_CRYPTO_FIPS_FORCED',
	/**
	 * <p>An attempt was made to enable or disable FIPS mode, but FIPS mode was not
	 * available.</p>
	 * <p><a id="ERR_CRYPTO_HASH_FINALIZED"></a></p>
	 */
	ERR_CRYPTO_FIPS_UNAVAILABLE = 'ERR_CRYPTO_FIPS_UNAVAILABLE',
	/**
	 * <p><a href="crypto.html#hashdigestencoding"><code>hash.digest()</code></a> was called multiple times. The <code>hash.digest()</code> method must
	 * be called no more than one time per instance of a <code>Hash</code> object.</p>
	 * <p><a id="ERR_CRYPTO_HASH_UPDATE_FAILED"></a></p>
	 */
	ERR_CRYPTO_HASH_FINALIZED = 'ERR_CRYPTO_HASH_FINALIZED',
	/**
	 * <p><a href="crypto.html#hashupdatedata-inputencoding"><code>hash.update()</code></a> failed for any reason. This should rarely, if ever, happen.</p>
	 * <p><a id="ERR_CRYPTO_INCOMPATIBLE_KEY"></a></p>
	 */
	ERR_CRYPTO_HASH_UPDATE_FAILED = 'ERR_CRYPTO_HASH_UPDATE_FAILED',
	/**
	 * <p>The given crypto keys are incompatible with the attempted operation.</p>
	 * <p><a id="ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS"></a></p>
	 */
	ERR_CRYPTO_INCOMPATIBLE_KEY = 'ERR_CRYPTO_INCOMPATIBLE_KEY',
	/**
	 * <p>The selected public or private key encoding is incompatible with other options.</p>
	 * <p><a id="ERR_CRYPTO_INITIALIZATION_FAILED"></a></p>
	 */
	ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS = 'ERR_CRYPTO_INCOMPATIBLE_KEY_OPTIONS',
	/**
	 * <p>Initialization of the crypto subsystem failed.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_AUTH_TAG"></a></p>
	 */
	ERR_CRYPTO_INITIALIZATION_FAILED = 'ERR_CRYPTO_INITIALIZATION_FAILED',
	/**
	 * <p>An invalid authentication tag was provided.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_COUNTER"></a></p>
	 */
	ERR_CRYPTO_INVALID_AUTH_TAG = 'ERR_CRYPTO_INVALID_AUTH_TAG',
	/**
	 * <p>An invalid counter was provided for a counter-mode cipher.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_CURVE"></a></p>
	 */
	ERR_CRYPTO_INVALID_COUNTER = 'ERR_CRYPTO_INVALID_COUNTER',
	/**
	 * <p>An invalid elliptic-curve was provided.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_DIGEST"></a></p>
	 */
	ERR_CRYPTO_INVALID_CURVE = 'ERR_CRYPTO_INVALID_CURVE',
	/**
	 * <p>An invalid <a href="crypto.html#cryptogethashes">crypto digest algorithm</a> was specified.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_IV"></a></p>
	 */
	ERR_CRYPTO_INVALID_DIGEST = 'ERR_CRYPTO_INVALID_DIGEST',
	/**
	 * <p>An invalid initialization vector was provided.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_JWK"></a></p>
	 */
	ERR_CRYPTO_INVALID_IV = 'ERR_CRYPTO_INVALID_IV',
	/**
	 * <p>An invalid JSON Web Key was provided.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_KEYLEN"></a></p>
	 */
	ERR_CRYPTO_INVALID_JWK = 'ERR_CRYPTO_INVALID_JWK',
	/**
	 * <p>An invalid key length was provided.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_KEYPAIR"></a></p>
	 */
	ERR_CRYPTO_INVALID_KEYLEN = 'ERR_CRYPTO_INVALID_KEYLEN',
	/**
	 * <p>An invalid key pair was provided.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_KEYTYPE"></a></p>
	 */
	ERR_CRYPTO_INVALID_KEYPAIR = 'ERR_CRYPTO_INVALID_KEYPAIR',
	/**
	 * <p>An invalid key type was provided.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE"></a></p>
	 */
	ERR_CRYPTO_INVALID_KEYTYPE = 'ERR_CRYPTO_INVALID_KEYTYPE',
	/**
	 * <p>The given crypto key object's type is invalid for the attempted operation.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_MESSAGELEN"></a></p>
	 */
	ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE = 'ERR_CRYPTO_INVALID_KEY_OBJECT_TYPE',
	/**
	 * <p>An invalid message length was provided.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_SCRYPT_PARAMS"></a></p>
	 */
	ERR_CRYPTO_INVALID_MESSAGELEN = 'ERR_CRYPTO_INVALID_MESSAGELEN',
	/**
	 * <p>One or more <a href="crypto.html#cryptoscryptpassword-salt-keylen-options-callback"><code>crypto.scrypt()</code></a> or <a href="crypto.html#cryptoscryptsyncpassword-salt-keylen-options"><code>crypto.scryptSync()</code></a> parameters are
	 * outside their legal range.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_STATE"></a></p>
	 */
	ERR_CRYPTO_INVALID_SCRYPT_PARAMS = 'ERR_CRYPTO_INVALID_SCRYPT_PARAMS',
	/**
	 * <p>A crypto method was used on an object that was in an invalid state. For
	 * instance, calling <a href="crypto.html#ciphergetauthtag"><code>cipher.getAuthTag()</code></a> before calling <code>cipher.final()</code>.</p>
	 * <p><a id="ERR_CRYPTO_INVALID_TAG_LENGTH"></a></p>
	 */
	ERR_CRYPTO_INVALID_STATE = 'ERR_CRYPTO_INVALID_STATE',
	/**
	 * <p>An invalid authentication tag length was provided.</p>
	 * <p><a id="ERR_CRYPTO_JOB_INIT_FAILED"></a></p>
	 */
	ERR_CRYPTO_INVALID_TAG_LENGTH = 'ERR_CRYPTO_INVALID_TAG_LENGTH',
	/**
	 * <p>Initialization of an asynchronous crypto operation failed.</p>
	 * <p><a id="ERR_CRYPTO_JWK_UNSUPPORTED_CURVE"></a></p>
	 */
	ERR_CRYPTO_JOB_INIT_FAILED = 'ERR_CRYPTO_JOB_INIT_FAILED',
	/**
	 * <p>Key's Elliptic Curve is not registered for use in the
	 * <a href="https://www.iana.org/assignments/jose/jose.xhtml#web-key-elliptic-curve">JSON Web Key Elliptic Curve Registry</a>.</p>
	 * <p><a id="ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE"></a></p>
	 */
	ERR_CRYPTO_JWK_UNSUPPORTED_CURVE = 'ERR_CRYPTO_JWK_UNSUPPORTED_CURVE',
	/**
	 * <p>Key's Asymmetric Key Type is not registered for use in the
	 * <a href="https://www.iana.org/assignments/jose/jose.xhtml#web-key-types">JSON Web Key Types Registry</a>.</p>
	 * <p><a id="ERR_CRYPTO_KEM_NOT_SUPPORTED"></a></p>
	 */
	ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE = 'ERR_CRYPTO_JWK_UNSUPPORTED_KEY_TYPE',
	/**
	 * <p>Attempted to use KEM operations while Node.js was not compiled with
	 * OpenSSL with KEM support.</p>
	 * <p><a id="ERR_CRYPTO_OPERATION_FAILED"></a></p>
	 */
	ERR_CRYPTO_KEM_NOT_SUPPORTED = 'ERR_CRYPTO_KEM_NOT_SUPPORTED',
	/**
	 * <p>A crypto operation failed for an otherwise unspecified reason.</p>
	 * <p><a id="ERR_CRYPTO_PBKDF2_ERROR"></a></p>
	 */
	ERR_CRYPTO_OPERATION_FAILED = 'ERR_CRYPTO_OPERATION_FAILED',
	/**
	 * <p>The PBKDF2 algorithm failed for unspecified reasons. OpenSSL does not provide
	 * more details and therefore neither does Node.js.</p>
	 * <p><a id="ERR_CRYPTO_SCRYPT_NOT_SUPPORTED"></a></p>
	 */
	ERR_CRYPTO_PBKDF2_ERROR = 'ERR_CRYPTO_PBKDF2_ERROR',
	/**
	 * <p>Node.js was compiled without <code>scrypt</code> support. Not possible with the official
	 * release binaries but can happen with custom builds, including distro builds.</p>
	 * <p><a id="ERR_CRYPTO_SIGN_KEY_REQUIRED"></a></p>
	 */
	ERR_CRYPTO_SCRYPT_NOT_SUPPORTED = 'ERR_CRYPTO_SCRYPT_NOT_SUPPORTED',
	/**
	 * <p>A signing <code>key</code> was not provided to the <a href="crypto.html#signsignprivatekey-outputencoding"><code>sign.sign()</code></a> method.</p>
	 * <p><a id="ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH"></a></p>
	 */
	ERR_CRYPTO_SIGN_KEY_REQUIRED = 'ERR_CRYPTO_SIGN_KEY_REQUIRED',
	/**
	 * <p><a href="crypto.html#cryptotimingsafeequala-b"><code>crypto.timingSafeEqual()</code></a> was called with <code>Buffer</code>, <code>TypedArray</code>, or
	 * <code>DataView</code> arguments of different lengths.</p>
	 * <p><a id="ERR_CRYPTO_UNKNOWN_CIPHER"></a></p>
	 */
	ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH = 'ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH',
	/**
	 * <p>An unknown cipher was specified.</p>
	 * <p><a id="ERR_CRYPTO_UNKNOWN_DH_GROUP"></a></p>
	 */
	ERR_CRYPTO_UNKNOWN_CIPHER = 'ERR_CRYPTO_UNKNOWN_CIPHER',
	/**
	 * <p>An unknown Diffie-Hellman group name was given. See
	 * <a href="crypto.html#cryptogetdiffiehellmangroupname"><code>crypto.getDiffieHellman()</code></a> for a list of valid group names.</p>
	 * <p><a id="ERR_CRYPTO_UNSUPPORTED_OPERATION"></a></p>
	 */
	ERR_CRYPTO_UNKNOWN_DH_GROUP = 'ERR_CRYPTO_UNKNOWN_DH_GROUP',
	/**
	 * <p>An attempt to invoke an unsupported crypto operation was made.</p>
	 * <p><a id="ERR_DEBUGGER_ERROR"></a></p>
	 */
	ERR_CRYPTO_UNSUPPORTED_OPERATION = 'ERR_CRYPTO_UNSUPPORTED_OPERATION',
	/**
	 * <p>An error occurred with the <a href="debugger.html">debugger</a>.</p>
	 * <p><a id="ERR_DEBUGGER_STARTUP_ERROR"></a></p>
	 */
	ERR_DEBUGGER_ERROR = 'ERR_DEBUGGER_ERROR',
	/**
	 * <p>The <a href="debugger.html">debugger</a> timed out waiting for the required host/port to be free.</p>
	 * <p><a id="ERR_DIR_CLOSED"></a></p>
	 */
	ERR_DEBUGGER_STARTUP_ERROR = 'ERR_DEBUGGER_STARTUP_ERROR',
	/**
	 * <p>The <a href="fs.html#class-fsdir"><code>fs.Dir</code></a> was previously closed.</p>
	 * <p><a id="ERR_DIR_CONCURRENT_OPERATION"></a></p>
	 */
	ERR_DIR_CLOSED = 'ERR_DIR_CLOSED',
	/**
	 * <p>A synchronous read or close call was attempted on an <a href="fs.html#class-fsdir"><code>fs.Dir</code></a> which has
	 * ongoing asynchronous operations.</p>
	 * <p><a id="ERR_DLOPEN_DISABLED"></a></p>
	 */
	ERR_DIR_CONCURRENT_OPERATION = 'ERR_DIR_CONCURRENT_OPERATION',
	/**
	 * <p>Loading native addons has been disabled using <a href="cli.html#--no-addons"><code>--no-addons</code></a>.</p>
	 * <p><a id="ERR_DLOPEN_FAILED"></a></p>
	 */
	ERR_DLOPEN_DISABLED = 'ERR_DLOPEN_DISABLED',
	/**
	 * <p>A call to <code>process.dlopen()</code> failed.</p>
	 * <p><a id="ERR_DNS_SET_SERVERS_FAILED"></a></p>
	 */
	ERR_DLOPEN_FAILED = 'ERR_DLOPEN_FAILED',
	/**
	 * <p><code>c-ares</code> failed to set the DNS server.</p>
	 * <p><a id="ERR_DOMAIN_CALLBACK_NOT_AVAILABLE"></a></p>
	 */
	ERR_DNS_SET_SERVERS_FAILED = 'ERR_DNS_SET_SERVERS_FAILED',
	/**
	 * <p>The <code>node:domain</code> module was not usable since it could not establish the
	 * required error handling hooks, because
	 * <a href="process.html#processsetuncaughtexceptioncapturecallbackfn"><code>process.setUncaughtExceptionCaptureCallback()</code></a> had been called at an
	 * earlier point in time.</p>
	 * <p><a id="ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE"></a></p>
	 */
	ERR_DOMAIN_CALLBACK_NOT_AVAILABLE = 'ERR_DOMAIN_CALLBACK_NOT_AVAILABLE',
	/**
	 * <p><a href="process.html#processsetuncaughtexceptioncapturecallbackfn"><code>process.setUncaughtExceptionCaptureCallback()</code></a> could not be called
	 * because the <code>node:domain</code> module has been loaded at an earlier point in time.</p>
	 * <p>The stack trace is extended to include the point in time at which the
	 * <code>node:domain</code> module had been loaded.</p>
	 * <p><a id="ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION"></a></p>
	 */
	ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE = 'ERR_DOMAIN_CANNOT_SET_UNCAUGHT_EXCEPTION_CAPTURE',
	/**
	 * <p><a href="v8.html#v8startupsnapshotsetdeserializemainfunctioncallback-data"><code>v8.startupSnapshot.setDeserializeMainFunction()</code></a> could not be called
	 * because it had already been called before.</p>
	 * <p><a id="ERR_ENCODING_INVALID_ENCODED_DATA"></a></p>
	 */
	ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION = 'ERR_DUPLICATE_STARTUP_SNAPSHOT_MAIN_FUNCTION',
	/**
	 * <p>Data provided to <code>TextDecoder()</code> API was invalid according to the encoding
	 * provided.</p>
	 * <p><a id="ERR_ENCODING_NOT_SUPPORTED"></a></p>
	 */
	ERR_ENCODING_INVALID_ENCODED_DATA = 'ERR_ENCODING_INVALID_ENCODED_DATA',
	/**
	 * <p>Encoding provided to <code>TextDecoder()</code> API was not one of the
	 * <a href="util.html#whatwg-supported-encodings">WHATWG Supported Encodings</a>.</p>
	 * <p><a id="ERR_EVAL_ESM_CANNOT_PRINT"></a></p>
	 */
	ERR_ENCODING_NOT_SUPPORTED = 'ERR_ENCODING_NOT_SUPPORTED',
	/**
	 * <p><code>--print</code> cannot be used with ESM input.</p>
	 * <p><a id="ERR_EVENT_RECURSION"></a></p>
	 */
	ERR_EVAL_ESM_CANNOT_PRINT = 'ERR_EVAL_ESM_CANNOT_PRINT',
	/**
	 * <p>Thrown when an attempt is made to recursively dispatch an event on <code>EventTarget</code>.</p>
	 * <p><a id="ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE"></a></p>
	 */
	ERR_EVENT_RECURSION = 'ERR_EVENT_RECURSION',
	/**
	 * <p>The JS execution context is not associated with a Node.js environment.
	 * This may occur when Node.js is used as an embedded library and some hooks
	 * for the JS engine are not set up properly.</p>
	 * <p><a id="ERR_FALSY_VALUE_REJECTION"></a></p>
	 */
	ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE = 'ERR_EXECUTION_ENVIRONMENT_NOT_AVAILABLE',
	/**
	 * <p>A <code>Promise</code> that was callbackified via <code>util.callbackify()</code> was rejected with a
	 * falsy value.</p>
	 * <p><a id="ERR_FEATURE_UNAVAILABLE_ON_PLATFORM"></a></p>
	 */
	ERR_FALSY_VALUE_REJECTION = 'ERR_FALSY_VALUE_REJECTION',
	/**
	 * <p>Used when a feature that is not available
	 * to the current platform which is running Node.js is used.</p>
	 * <p><a id="ERR_FS_CP_DIR_TO_NON_DIR"></a></p>
	 */
	ERR_FEATURE_UNAVAILABLE_ON_PLATFORM = 'ERR_FEATURE_UNAVAILABLE_ON_PLATFORM',
	/**
	 * <p>An attempt was made to copy a directory to a non-directory (file, symlink,
	 * etc.) using <a href="fs.html#fscpsrc-dest-options-callback"><code>fs.cp()</code></a>.</p>
	 * <p><a id="ERR_FS_CP_EEXIST"></a></p>
	 */
	ERR_FS_CP_DIR_TO_NON_DIR = 'ERR_FS_CP_DIR_TO_NON_DIR',
	/**
	 * <p>An attempt was made to copy over a file that already existed with
	 * <a href="fs.html#fscpsrc-dest-options-callback"><code>fs.cp()</code></a>, with the <code>force</code> and <code>errorOnExist</code> set to <code>true</code>.</p>
	 * <p><a id="ERR_FS_CP_EINVAL"></a></p>
	 */
	ERR_FS_CP_EEXIST = 'ERR_FS_CP_EEXIST',
	/**
	 * <p>When using <a href="fs.html#fscpsrc-dest-options-callback"><code>fs.cp()</code></a>, <code>src</code> or <code>dest</code> pointed to an invalid path.</p>
	 * <p><a id="ERR_FS_CP_FIFO_PIPE"></a></p>
	 */
	ERR_FS_CP_EINVAL = 'ERR_FS_CP_EINVAL',
	/**
	 * <p>An attempt was made to copy a named pipe with <a href="fs.html#fscpsrc-dest-options-callback"><code>fs.cp()</code></a>.</p>
	 * <p><a id="ERR_FS_CP_NON_DIR_TO_DIR"></a></p>
	 */
	ERR_FS_CP_FIFO_PIPE = 'ERR_FS_CP_FIFO_PIPE',
	/**
	 * <p>An attempt was made to copy a non-directory (file, symlink, etc.) to a directory
	 * using <a href="fs.html#fscpsrc-dest-options-callback"><code>fs.cp()</code></a>.</p>
	 * <p><a id="ERR_FS_CP_SOCKET"></a></p>
	 */
	ERR_FS_CP_NON_DIR_TO_DIR = 'ERR_FS_CP_NON_DIR_TO_DIR',
	/**
	 * <p>An attempt was made to copy to a socket with <a href="fs.html#fscpsrc-dest-options-callback"><code>fs.cp()</code></a>.</p>
	 * <p><a id="ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY"></a></p>
	 */
	ERR_FS_CP_SOCKET = 'ERR_FS_CP_SOCKET',
	/**
	 * <p>When using <a href="fs.html#fscpsrc-dest-options-callback"><code>fs.cp()</code></a>, a symlink in <code>dest</code> pointed to a subdirectory
	 * of <code>src</code>.</p>
	 * <p><a id="ERR_FS_CP_UNKNOWN"></a></p>
	 */
	ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY = 'ERR_FS_CP_SYMLINK_TO_SUBDIRECTORY',
	/**
	 * <p>An attempt was made to copy to an unknown file type with <a href="fs.html#fscpsrc-dest-options-callback"><code>fs.cp()</code></a>.</p>
	 * <p><a id="ERR_FS_EISDIR"></a></p>
	 */
	ERR_FS_CP_UNKNOWN = 'ERR_FS_CP_UNKNOWN',
	/**
	 * <p>Path is a directory.</p>
	 * <p><a id="ERR_FS_FILE_TOO_LARGE"></a></p>
	 */
	ERR_FS_EISDIR = 'ERR_FS_EISDIR',
	/**
	 * <p>An attempt was made to read a file larger than the supported 2 GiB limit for
	 * <code>fs.readFile()</code>. This is not a limitation of <code>Buffer</code>, but an internal I/O constraint.
	 * For handling larger files, consider using <code>fs.createReadStream()</code> to read the
	 * file in chunks.</p>
	 * <p><a id="ERR_FS_WATCH_QUEUE_OVERFLOW"></a></p>
	 */
	ERR_FS_FILE_TOO_LARGE = 'ERR_FS_FILE_TOO_LARGE',
	/**
	 * <p>The number of file system events queued without being handled exceeded the size specified in
	 * <code>maxQueue</code> in <code>fs.watch()</code>.</p>
	 * <p><a id="ERR_HTTP2_ALTSVC_INVALID_ORIGIN"></a></p>
	 */
	ERR_FS_WATCH_QUEUE_OVERFLOW = 'ERR_FS_WATCH_QUEUE_OVERFLOW',
	/**
	 * <p>HTTP/2 ALTSVC frames require a valid origin.</p>
	 * <p><a id="ERR_HTTP2_ALTSVC_LENGTH"></a></p>
	 */
	ERR_HTTP2_ALTSVC_INVALID_ORIGIN = 'ERR_HTTP2_ALTSVC_INVALID_ORIGIN',
	/**
	 * <p>HTTP/2 ALTSVC frames are limited to a maximum of 16,382 payload bytes.</p>
	 * <p><a id="ERR_HTTP2_CONNECT_AUTHORITY"></a></p>
	 */
	ERR_HTTP2_ALTSVC_LENGTH = 'ERR_HTTP2_ALTSVC_LENGTH',
	/**
	 * <p>For HTTP/2 requests using the <code>CONNECT</code> method, the <code>:authority</code> pseudo-header
	 * is required.</p>
	 * <p><a id="ERR_HTTP2_CONNECT_PATH"></a></p>
	 */
	ERR_HTTP2_CONNECT_AUTHORITY = 'ERR_HTTP2_CONNECT_AUTHORITY',
	/**
	 * <p>For HTTP/2 requests using the <code>CONNECT</code> method, the <code>:path</code> pseudo-header is
	 * forbidden.</p>
	 * <p><a id="ERR_HTTP2_CONNECT_SCHEME"></a></p>
	 */
	ERR_HTTP2_CONNECT_PATH = 'ERR_HTTP2_CONNECT_PATH',
	/**
	 * <p>For HTTP/2 requests using the <code>CONNECT</code> method, the <code>:scheme</code> pseudo-header is
	 * forbidden.</p>
	 * <p><a id="ERR_HTTP2_ERROR"></a></p>
	 */
	ERR_HTTP2_CONNECT_SCHEME = 'ERR_HTTP2_CONNECT_SCHEME',
	/**
	 * <p>A non-specific HTTP/2 error has occurred.</p>
	 * <p><a id="ERR_HTTP2_GOAWAY_SESSION"></a></p>
	 */
	ERR_HTTP2_ERROR = 'ERR_HTTP2_ERROR',
	/**
	 * <p>New HTTP/2 Streams may not be opened after the <code>Http2Session</code> has received a
	 * <code>GOAWAY</code> frame from the connected peer.</p>
	 * <p><a id="ERR_HTTP2_HEADERS_AFTER_RESPOND"></a></p>
	 */
	ERR_HTTP2_GOAWAY_SESSION = 'ERR_HTTP2_GOAWAY_SESSION',
	/**
	 * <p>An additional headers was specified after an HTTP/2 response was initiated.</p>
	 * <p><a id="ERR_HTTP2_HEADERS_SENT"></a></p>
	 */
	ERR_HTTP2_HEADERS_AFTER_RESPOND = 'ERR_HTTP2_HEADERS_AFTER_RESPOND',
	/**
	 * <p>An attempt was made to send multiple response headers.</p>
	 * <p><a id="ERR_HTTP2_HEADER_SINGLE_VALUE"></a></p>
	 */
	ERR_HTTP2_HEADERS_SENT = 'ERR_HTTP2_HEADERS_SENT',
	/**
	 * <p>Multiple values were provided for an HTTP/2 header field that was required to
	 * have only a single value.</p>
	 * <p><a id="ERR_HTTP2_INFO_STATUS_NOT_ALLOWED"></a></p>
	 */
	ERR_HTTP2_HEADER_SINGLE_VALUE = 'ERR_HTTP2_HEADER_SINGLE_VALUE',
	/**
	 * <p>Informational HTTP status codes (<code>1xx</code>) may not be set as the response status
	 * code on HTTP/2 responses.</p>
	 * <p><a id="ERR_HTTP2_INVALID_CONNECTION_HEADERS"></a></p>
	 */
	ERR_HTTP2_INFO_STATUS_NOT_ALLOWED = 'ERR_HTTP2_INFO_STATUS_NOT_ALLOWED',
	/**
	 * <p>HTTP/1 connection specific headers are forbidden to be used in HTTP/2
	 * requests and responses.</p>
	 * <p><a id="ERR_HTTP2_INVALID_HEADER_VALUE"></a></p>
	 */
	ERR_HTTP2_INVALID_CONNECTION_HEADERS = 'ERR_HTTP2_INVALID_CONNECTION_HEADERS',
	/**
	 * <p>An invalid HTTP/2 header value was specified.</p>
	 * <p><a id="ERR_HTTP2_INVALID_INFO_STATUS"></a></p>
	 */
	ERR_HTTP2_INVALID_HEADER_VALUE = 'ERR_HTTP2_INVALID_HEADER_VALUE',
	/**
	 * <p>An invalid HTTP informational status code has been specified. Informational
	 * status codes must be an integer between <code>100</code> and <code>199</code> (inclusive).</p>
	 * <p><a id="ERR_HTTP2_INVALID_ORIGIN"></a></p>
	 */
	ERR_HTTP2_INVALID_INFO_STATUS = 'ERR_HTTP2_INVALID_INFO_STATUS',
	/**
	 * <p>HTTP/2 <code>ORIGIN</code> frames require a valid origin.</p>
	 * <p><a id="ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH"></a></p>
	 */
	ERR_HTTP2_INVALID_ORIGIN = 'ERR_HTTP2_INVALID_ORIGIN',
	/**
	 * <p>Input <code>Buffer</code> and <code>Uint8Array</code> instances passed to the
	 * <code>http2.getUnpackedSettings()</code> API must have a length that is a multiple of
	 * six.</p>
	 * <p><a id="ERR_HTTP2_INVALID_PSEUDOHEADER"></a></p>
	 */
	ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH = 'ERR_HTTP2_INVALID_PACKED_SETTINGS_LENGTH',
	/**
	 * <p>Only valid HTTP/2 pseudoheaders (<code>:status</code>, <code>:path</code>, <code>:authority</code>, <code>:scheme</code>,
	 * and <code>:method</code>) may be used.</p>
	 * <p><a id="ERR_HTTP2_INVALID_SESSION"></a></p>
	 */
	ERR_HTTP2_INVALID_PSEUDOHEADER = 'ERR_HTTP2_INVALID_PSEUDOHEADER',
	/**
	 * <p>An action was performed on an <code>Http2Session</code> object that had already been
	 * destroyed.</p>
	 * <p><a id="ERR_HTTP2_INVALID_SETTING_VALUE"></a></p>
	 */
	ERR_HTTP2_INVALID_SESSION = 'ERR_HTTP2_INVALID_SESSION',
	/**
	 * <p>An invalid value has been specified for an HTTP/2 setting.</p>
	 * <p><a id="ERR_HTTP2_INVALID_STREAM"></a></p>
	 */
	ERR_HTTP2_INVALID_SETTING_VALUE = 'ERR_HTTP2_INVALID_SETTING_VALUE',
	/**
	 * <p>An operation was performed on a stream that had already been destroyed.</p>
	 * <p><a id="ERR_HTTP2_MAX_PENDING_SETTINGS_ACK"></a></p>
	 */
	ERR_HTTP2_INVALID_STREAM = 'ERR_HTTP2_INVALID_STREAM',
	/**
	 * <p>Whenever an HTTP/2 <code>SETTINGS</code> frame is sent to a connected peer, the peer is
	 * required to send an acknowledgment that it has received and applied the new
	 * <code>SETTINGS</code>. By default, a maximum number of unacknowledged <code>SETTINGS</code> frames may
	 * be sent at any given time. This error code is used when that limit has been
	 * reached.</p>
	 * <p><a id="ERR_HTTP2_NESTED_PUSH"></a></p>
	 */
	ERR_HTTP2_MAX_PENDING_SETTINGS_ACK = 'ERR_HTTP2_MAX_PENDING_SETTINGS_ACK',
	/**
	 * <p>An attempt was made to initiate a new push stream from within a push stream.
	 * Nested push streams are not permitted.</p>
	 * <p><a id="ERR_HTTP2_NO_MEM"></a></p>
	 */
	ERR_HTTP2_NESTED_PUSH = 'ERR_HTTP2_NESTED_PUSH',
	/**
	 * <p>Out of memory when using the <code>http2session.setLocalWindowSize(windowSize)</code> API.</p>
	 * <p><a id="ERR_HTTP2_NO_SOCKET_MANIPULATION"></a></p>
	 */
	ERR_HTTP2_NO_MEM = 'ERR_HTTP2_NO_MEM',
	/**
	 * <p>An attempt was made to directly manipulate (read, write, pause, resume, etc.) a
	 * socket attached to an <code>Http2Session</code>.</p>
	 * <p><a id="ERR_HTTP2_ORIGIN_LENGTH"></a></p>
	 */
	ERR_HTTP2_NO_SOCKET_MANIPULATION = 'ERR_HTTP2_NO_SOCKET_MANIPULATION',
	/**
	 * <p>HTTP/2 <code>ORIGIN</code> frames are limited to a length of 16382 bytes.</p>
	 * <p><a id="ERR_HTTP2_OUT_OF_STREAMS"></a></p>
	 */
	ERR_HTTP2_ORIGIN_LENGTH = 'ERR_HTTP2_ORIGIN_LENGTH',
	/**
	 * <p>The number of streams created on a single HTTP/2 session reached the maximum
	 * limit.</p>
	 * <p><a id="ERR_HTTP2_PAYLOAD_FORBIDDEN"></a></p>
	 */
	ERR_HTTP2_OUT_OF_STREAMS = 'ERR_HTTP2_OUT_OF_STREAMS',
	/**
	 * <p>A message payload was specified for an HTTP response code for which a payload is
	 * forbidden.</p>
	 * <p><a id="ERR_HTTP2_PING_CANCEL"></a></p>
	 */
	ERR_HTTP2_PAYLOAD_FORBIDDEN = 'ERR_HTTP2_PAYLOAD_FORBIDDEN',
	/**
	 * <p>An HTTP/2 ping was canceled.</p>
	 * <p><a id="ERR_HTTP2_PING_LENGTH"></a></p>
	 */
	ERR_HTTP2_PING_CANCEL = 'ERR_HTTP2_PING_CANCEL',
	/**
	 * <p>HTTP/2 ping payloads must be exactly 8 bytes in length.</p>
	 * <p><a id="ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED"></a></p>
	 */
	ERR_HTTP2_PING_LENGTH = 'ERR_HTTP2_PING_LENGTH',
	/**
	 * <p>An HTTP/2 pseudo-header has been used inappropriately. Pseudo-headers are header
	 * key names that begin with the <code>:</code> prefix.</p>
	 * <p><a id="ERR_HTTP2_PUSH_DISABLED"></a></p>
	 */
	ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED = 'ERR_HTTP2_PSEUDOHEADER_NOT_ALLOWED',
	/**
	 * <p>An attempt was made to create a push stream, which had been disabled by the
	 * client.</p>
	 * <p><a id="ERR_HTTP2_SEND_FILE"></a></p>
	 */
	ERR_HTTP2_PUSH_DISABLED = 'ERR_HTTP2_PUSH_DISABLED',
	/**
	 * <p>An attempt was made to use the <code>Http2Stream.prototype.responseWithFile()</code> API to
	 * send a directory.</p>
	 * <p><a id="ERR_HTTP2_SEND_FILE_NOSEEK"></a></p>
	 */
	ERR_HTTP2_SEND_FILE = 'ERR_HTTP2_SEND_FILE',
	/**
	 * <p>An attempt was made to use the <code>Http2Stream.prototype.responseWithFile()</code> API to
	 * send something other than a regular file, but <code>offset</code> or <code>length</code> options were
	 * provided.</p>
	 * <p><a id="ERR_HTTP2_SESSION_ERROR"></a></p>
	 */
	ERR_HTTP2_SEND_FILE_NOSEEK = 'ERR_HTTP2_SEND_FILE_NOSEEK',
	/**
	 * <p>The <code>Http2Session</code> closed with a non-zero error code.</p>
	 * <p><a id="ERR_HTTP2_SETTINGS_CANCEL"></a></p>
	 */
	ERR_HTTP2_SESSION_ERROR = 'ERR_HTTP2_SESSION_ERROR',
	/**
	 * <p>The <code>Http2Session</code> settings canceled.</p>
	 * <p><a id="ERR_HTTP2_SOCKET_BOUND"></a></p>
	 */
	ERR_HTTP2_SETTINGS_CANCEL = 'ERR_HTTP2_SETTINGS_CANCEL',
	/**
	 * <p>An attempt was made to connect a <code>Http2Session</code> object to a <code>net.Socket</code> or
	 * <code>tls.TLSSocket</code> that had already been bound to another <code>Http2Session</code> object.</p>
	 * <p><a id="ERR_HTTP2_SOCKET_UNBOUND"></a></p>
	 */
	ERR_HTTP2_SOCKET_BOUND = 'ERR_HTTP2_SOCKET_BOUND',
	/**
	 * <p>An attempt was made to use the <code>socket</code> property of an <code>Http2Session</code> that
	 * has already been closed.</p>
	 * <p><a id="ERR_HTTP2_STATUS_101"></a></p>
	 */
	ERR_HTTP2_SOCKET_UNBOUND = 'ERR_HTTP2_SOCKET_UNBOUND',
	/**
	 * <p>Use of the <code>101</code> Informational status code is forbidden in HTTP/2.</p>
	 * <p><a id="ERR_HTTP2_STATUS_INVALID"></a></p>
	 */
	ERR_HTTP2_STATUS_101 = 'ERR_HTTP2_STATUS_101',
	/**
	 * <p>An invalid HTTP status code has been specified. Status codes must be an integer
	 * between <code>100</code> and <code>599</code> (inclusive).</p>
	 * <p><a id="ERR_HTTP2_STREAM_CANCEL"></a></p>
	 */
	ERR_HTTP2_STATUS_INVALID = 'ERR_HTTP2_STATUS_INVALID',
	/**
	 * <p>An <code>Http2Stream</code> was destroyed before any data was transmitted to the connected
	 * peer.</p>
	 * <p><a id="ERR_HTTP2_STREAM_ERROR"></a></p>
	 */
	ERR_HTTP2_STREAM_CANCEL = 'ERR_HTTP2_STREAM_CANCEL',
	/**
	 * <p>A non-zero error code was been specified in an <code>RST_STREAM</code> frame.</p>
	 * <p><a id="ERR_HTTP2_STREAM_SELF_DEPENDENCY"></a></p>
	 */
	ERR_HTTP2_STREAM_ERROR = 'ERR_HTTP2_STREAM_ERROR',
	/**
	 * <p>When setting the priority for an HTTP/2 stream, the stream may be marked as
	 * a dependency for a parent stream. This error code is used when an attempt is
	 * made to mark a stream and dependent of itself.</p>
	 * <p><a id="ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS"></a></p>
	 */
	ERR_HTTP2_STREAM_SELF_DEPENDENCY = 'ERR_HTTP2_STREAM_SELF_DEPENDENCY',
	/**
	 * <p>The number of supported custom settings (10) has been exceeded.</p>
	 * <p><a id="ERR_HTTP2_TOO_MANY_INVALID_FRAMES"></a></p>
	 */
	ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS = 'ERR_HTTP2_TOO_MANY_CUSTOM_SETTINGS',
	/**
	 * <p>The limit of acceptable invalid HTTP/2 protocol frames sent by the peer,
	 * as specified through the <code>maxSessionInvalidFrames</code> option, has been exceeded.</p>
	 * <p><a id="ERR_HTTP2_TRAILERS_ALREADY_SENT"></a></p>
	 */
	ERR_HTTP2_TOO_MANY_INVALID_FRAMES = 'ERR_HTTP2_TOO_MANY_INVALID_FRAMES',
	/**
	 * <p>Trailing headers have already been sent on the <code>Http2Stream</code>.</p>
	 * <p><a id="ERR_HTTP2_TRAILERS_NOT_READY"></a></p>
	 */
	ERR_HTTP2_TRAILERS_ALREADY_SENT = 'ERR_HTTP2_TRAILERS_ALREADY_SENT',
	/**
	 * <p>The <code>http2stream.sendTrailers()</code> method cannot be called until after the
	 * <code>'wantTrailers'</code> event is emitted on an <code>Http2Stream</code> object. The
	 * <code>'wantTrailers'</code> event will only be emitted if the <code>waitForTrailers</code> option
	 * is set for the <code>Http2Stream</code>.</p>
	 * <p><a id="ERR_HTTP2_UNSUPPORTED_PROTOCOL"></a></p>
	 */
	ERR_HTTP2_TRAILERS_NOT_READY = 'ERR_HTTP2_TRAILERS_NOT_READY',
	/**
	 * <p><code>http2.connect()</code> was passed a URL that uses any protocol other than <code>http:</code> or
	 * <code>https:</code>.</p>
	 * <p><a id="ERR_HTTP_BODY_NOT_ALLOWED"></a></p>
	 */
	ERR_HTTP2_UNSUPPORTED_PROTOCOL = 'ERR_HTTP2_UNSUPPORTED_PROTOCOL',
	/**
	 * <p>An error is thrown when writing to an HTTP response which does not allow
	 * contents.</p>
	 * <p><a id="ERR_HTTP_CONTENT_LENGTH_MISMATCH"></a></p>
	 */
	ERR_HTTP_BODY_NOT_ALLOWED = 'ERR_HTTP_BODY_NOT_ALLOWED',
	/**
	 * <p>Response body size doesn't match with the specified content-length header value.</p>
	 * <p><a id="ERR_HTTP_HEADERS_SENT"></a></p>
	 */
	ERR_HTTP_CONTENT_LENGTH_MISMATCH = 'ERR_HTTP_CONTENT_LENGTH_MISMATCH',
	/**
	 * <p>An attempt was made to add more headers after the headers had already been sent.</p>
	 * <p><a id="ERR_HTTP_INVALID_HEADER_VALUE"></a></p>
	 */
	ERR_HTTP_HEADERS_SENT = 'ERR_HTTP_HEADERS_SENT',
	/**
	 * <p>An invalid HTTP header value was specified.</p>
	 * <p><a id="ERR_HTTP_INVALID_STATUS_CODE"></a></p>
	 */
	ERR_HTTP_INVALID_HEADER_VALUE = 'ERR_HTTP_INVALID_HEADER_VALUE',
	/**
	 * <p>Status code was outside the regular status code range (100-999).</p>
	 * <p><a id="ERR_HTTP_REQUEST_TIMEOUT"></a></p>
	 */
	ERR_HTTP_INVALID_STATUS_CODE = 'ERR_HTTP_INVALID_STATUS_CODE',
	/**
	 * <p>The client has not sent the entire request within the allowed time.</p>
	 * <p><a id="ERR_HTTP_SOCKET_ASSIGNED"></a></p>
	 */
	ERR_HTTP_REQUEST_TIMEOUT = 'ERR_HTTP_REQUEST_TIMEOUT',
	/**
	 * <p>The given <a href="http.html#class-httpserverresponse"><code>ServerResponse</code></a> was already assigned a socket.</p>
	 * <p><a id="ERR_HTTP_SOCKET_ENCODING"></a></p>
	 */
	ERR_HTTP_SOCKET_ASSIGNED = 'ERR_HTTP_SOCKET_ASSIGNED',
	/**
	 * <p>Changing the socket encoding is not allowed per <a href="https://tools.ietf.org/html/rfc7230#section-3">RFC 7230 Section 3</a>.</p>
	 * <p><a id="ERR_HTTP_TRAILER_INVALID"></a></p>
	 */
	ERR_HTTP_SOCKET_ENCODING = 'ERR_HTTP_SOCKET_ENCODING',
	/**
	 * <p>The <code>Trailer</code> header was set even though the transfer encoding does not support
	 * that.</p>
	 * <p><a id="ERR_ILLEGAL_CONSTRUCTOR"></a></p>
	 */
	ERR_HTTP_TRAILER_INVALID = 'ERR_HTTP_TRAILER_INVALID',
	/**
	 * <p>An attempt was made to construct an object using a non-public constructor.</p>
	 * <p><a id="ERR_IMPORT_ATTRIBUTE_MISSING"></a></p>
	 */
	ERR_ILLEGAL_CONSTRUCTOR = 'ERR_ILLEGAL_CONSTRUCTOR',
	/**
	 * <p>An import attribute is missing, preventing the specified module to be imported.</p>
	 * <p><a id="ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE"></a></p>
	 */
	ERR_IMPORT_ATTRIBUTE_MISSING = 'ERR_IMPORT_ATTRIBUTE_MISSING',
	/**
	 * <p>An import <code>type</code> attribute was provided, but the specified module is of a
	 * different type.</p>
	 * <p><a id="ERR_IMPORT_ATTRIBUTE_UNSUPPORTED"></a></p>
	 */
	ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE = 'ERR_IMPORT_ATTRIBUTE_TYPE_INCOMPATIBLE',
	/**
	 * <p>An import attribute is not supported by this version of Node.js.</p>
	 * <p><a id="ERR_INCOMPATIBLE_OPTION_PAIR"></a></p>
	 */
	ERR_IMPORT_ATTRIBUTE_UNSUPPORTED = 'ERR_IMPORT_ATTRIBUTE_UNSUPPORTED',
	/**
	 * <p>An option pair is incompatible with each other and cannot be used at the same
	 * time.</p>
	 * <p><a id="ERR_INPUT_TYPE_NOT_ALLOWED"></a></p>
	 */
	ERR_INCOMPATIBLE_OPTION_PAIR = 'ERR_INCOMPATIBLE_OPTION_PAIR',
	/**
	 * <p>The <code>--input-type</code> flag was used to attempt to execute a file. This flag can
	 * only be used with input via <code>--eval</code>, <code>--print</code>, or <code>STDIN</code>.</p>
	 * <p><a id="ERR_INSPECTOR_ALREADY_ACTIVATED"></a></p>
	 */
	ERR_INPUT_TYPE_NOT_ALLOWED = 'ERR_INPUT_TYPE_NOT_ALLOWED',
	/**
	 * <p>While using the <code>node:inspector</code> module, an attempt was made to activate the
	 * inspector when it already started to listen on a port. Use <code>inspector.close()</code>
	 * before activating it on a different address.</p>
	 * <p><a id="ERR_INSPECTOR_ALREADY_CONNECTED"></a></p>
	 */
	ERR_INSPECTOR_ALREADY_ACTIVATED = 'ERR_INSPECTOR_ALREADY_ACTIVATED',
	/**
	 * <p>While using the <code>node:inspector</code> module, an attempt was made to connect when the
	 * inspector was already connected.</p>
	 * <p><a id="ERR_INSPECTOR_CLOSED"></a></p>
	 */
	ERR_INSPECTOR_ALREADY_CONNECTED = 'ERR_INSPECTOR_ALREADY_CONNECTED',
	/**
	 * <p>While using the <code>node:inspector</code> module, an attempt was made to use the
	 * inspector after the session had already closed.</p>
	 * <p><a id="ERR_INSPECTOR_COMMAND"></a></p>
	 */
	ERR_INSPECTOR_CLOSED = 'ERR_INSPECTOR_CLOSED',
	/**
	 * <p>An error occurred while issuing a command via the <code>node:inspector</code> module.</p>
	 * <p><a id="ERR_INSPECTOR_NOT_ACTIVE"></a></p>
	 */
	ERR_INSPECTOR_COMMAND = 'ERR_INSPECTOR_COMMAND',
	/**
	 * <p>The <code>inspector</code> is not active when <code>inspector.waitForDebugger()</code> is called.</p>
	 * <p><a id="ERR_INSPECTOR_NOT_AVAILABLE"></a></p>
	 */
	ERR_INSPECTOR_NOT_ACTIVE = 'ERR_INSPECTOR_NOT_ACTIVE',
	/**
	 * <p>The <code>node:inspector</code> module is not available for use.</p>
	 * <p><a id="ERR_INSPECTOR_NOT_CONNECTED"></a></p>
	 */
	ERR_INSPECTOR_NOT_AVAILABLE = 'ERR_INSPECTOR_NOT_AVAILABLE',
	/**
	 * <p>While using the <code>node:inspector</code> module, an attempt was made to use the
	 * inspector before it was connected.</p>
	 * <p><a id="ERR_INSPECTOR_NOT_WORKER"></a></p>
	 */
	ERR_INSPECTOR_NOT_CONNECTED = 'ERR_INSPECTOR_NOT_CONNECTED',
	/**
	 * <p>An API was called on the main thread that can only be used from
	 * the worker thread.</p>
	 * <p><a id="ERR_INTERNAL_ASSERTION"></a></p>
	 */
	ERR_INSPECTOR_NOT_WORKER = 'ERR_INSPECTOR_NOT_WORKER',
	/**
	 * <p>There was a bug in Node.js or incorrect usage of Node.js internals.
	 * To fix the error, open an issue at <a href="https://github.com/nodejs/node/issues">https://github.com/nodejs/node/issues</a>.</p>
	 * <p><a id="ERR_INVALID_ADDRESS"></a></p>
	 */
	ERR_INTERNAL_ASSERTION = 'ERR_INTERNAL_ASSERTION',
	/**
	 * <p>The provided address is not understood by the Node.js API.</p>
	 * <p><a id="ERR_INVALID_ADDRESS_FAMILY"></a></p>
	 */
	ERR_INVALID_ADDRESS = 'ERR_INVALID_ADDRESS',
	/**
	 * <p>The provided address family is not understood by the Node.js API.</p>
	 * <p><a id="ERR_INVALID_ARG_TYPE"></a></p>
	 */
	ERR_INVALID_ADDRESS_FAMILY = 'ERR_INVALID_ADDRESS_FAMILY',
	/**
	 * <p>An argument of the wrong type was passed to a Node.js API.</p>
	 * <p><a id="ERR_INVALID_ARG_VALUE"></a></p>
	 */
	ERR_INVALID_ARG_TYPE = 'ERR_INVALID_ARG_TYPE',
	/**
	 * <p>An invalid or unsupported value was passed for a given argument.</p>
	 * <p><a id="ERR_INVALID_ASYNC_ID"></a></p>
	 */
	ERR_INVALID_ARG_VALUE = 'ERR_INVALID_ARG_VALUE',
	/**
	 * <p>An invalid <code>asyncId</code> or <code>triggerAsyncId</code> was passed using <code>AsyncHooks</code>. An id
	 * less than -1 should never happen.</p>
	 * <p><a id="ERR_INVALID_BUFFER_SIZE"></a></p>
	 */
	ERR_INVALID_ASYNC_ID = 'ERR_INVALID_ASYNC_ID',
	/**
	 * <p>A swap was performed on a <code>Buffer</code> but its size was not compatible with the
	 * operation.</p>
	 * <p><a id="ERR_INVALID_CHAR"></a></p>
	 */
	ERR_INVALID_BUFFER_SIZE = 'ERR_INVALID_BUFFER_SIZE',
	/**
	 * <p>Invalid characters were detected in headers.</p>
	 * <p><a id="ERR_INVALID_CURSOR_POS"></a></p>
	 */
	ERR_INVALID_CHAR = 'ERR_INVALID_CHAR',
	/**
	 * <p>A cursor on a given stream cannot be moved to a specified row without a
	 * specified column.</p>
	 * <p><a id="ERR_INVALID_FD"></a></p>
	 */
	ERR_INVALID_CURSOR_POS = 'ERR_INVALID_CURSOR_POS',
	/**
	 * <p>A file descriptor ('fd') was not valid (e.g. it was a negative value).</p>
	 * <p><a id="ERR_INVALID_FD_TYPE"></a></p>
	 */
	ERR_INVALID_FD = 'ERR_INVALID_FD',
	/**
	 * <p>A file descriptor ('fd') type was not valid.</p>
	 * <p><a id="ERR_INVALID_FILE_URL_HOST"></a></p>
	 */
	ERR_INVALID_FD_TYPE = 'ERR_INVALID_FD_TYPE',
	/**
	 * <p>A Node.js API that consumes <code>file:</code> URLs (such as certain functions in the
	 * <a href="fs.html"><code>fs</code></a> module) encountered a file URL with an incompatible host. This
	 * situation can only occur on Unix-like systems where only <code>localhost</code> or an empty
	 * host is supported.</p>
	 * <p><a id="ERR_INVALID_FILE_URL_PATH"></a></p>
	 */
	ERR_INVALID_FILE_URL_HOST = 'ERR_INVALID_FILE_URL_HOST',
	/**
	 * <p>A Node.js API that consumes <code>file:</code> URLs (such as certain functions in the
	 * <a href="fs.html"><code>fs</code></a> module) encountered a file URL with an incompatible path. The exact
	 * semantics for determining whether a path can be used is platform-dependent.</p>
	 * <p>The thrown error object includes an <code>input</code> property that contains the URL object
	 * of the invalid <code>file:</code> URL.</p>
	 * <p><a id="ERR_INVALID_HANDLE_TYPE"></a></p>
	 */
	ERR_INVALID_FILE_URL_PATH = 'ERR_INVALID_FILE_URL_PATH',
	/**
	 * <p>An attempt was made to send an unsupported "handle" over an IPC communication
	 * channel to a child process. See <a href="child_process.html#subprocesssendmessage-sendhandle-options-callback"><code>subprocess.send()</code></a> and <a href="process.html#processsendmessage-sendhandle-options-callback"><code>process.send()</code></a>
	 * for more information.</p>
	 * <p><a id="ERR_INVALID_HTTP_TOKEN"></a></p>
	 */
	ERR_INVALID_HANDLE_TYPE = 'ERR_INVALID_HANDLE_TYPE',
	/**
	 * <p>An invalid HTTP token was supplied.</p>
	 * <p><a id="ERR_INVALID_IP_ADDRESS"></a></p>
	 */
	ERR_INVALID_HTTP_TOKEN = 'ERR_INVALID_HTTP_TOKEN',
	/**
	 * <p>An IP address is not valid.</p>
	 * <p><a id="ERR_INVALID_MIME_SYNTAX"></a></p>
	 */
	ERR_INVALID_IP_ADDRESS = 'ERR_INVALID_IP_ADDRESS',
	/**
	 * <p>The syntax of a MIME is not valid.</p>
	 * <p><a id="ERR_INVALID_MODULE"></a></p>
	 */
	ERR_INVALID_MIME_SYNTAX = 'ERR_INVALID_MIME_SYNTAX',
	/**
	 * <p>An attempt was made to load a module that does not exist or was otherwise not
	 * valid.</p>
	 * <p><a id="ERR_INVALID_MODULE_SPECIFIER"></a></p>
	 */
	ERR_INVALID_MODULE = 'ERR_INVALID_MODULE',
	/**
	 * <p>The imported module string is an invalid URL, package name, or package subpath
	 * specifier.</p>
	 * <p><a id="ERR_INVALID_OBJECT_DEFINE_PROPERTY"></a></p>
	 */
	ERR_INVALID_MODULE_SPECIFIER = 'ERR_INVALID_MODULE_SPECIFIER',
	/**
	 * <p>An error occurred while setting an invalid attribute on the property of
	 * an object.</p>
	 * <p><a id="ERR_INVALID_PACKAGE_CONFIG"></a></p>
	 */
	ERR_INVALID_OBJECT_DEFINE_PROPERTY = 'ERR_INVALID_OBJECT_DEFINE_PROPERTY',
	/**
	 * <p>An invalid <a href="packages.html#nodejs-packagejson-field-definitions"><code>package.json</code></a> file failed parsing.</p>
	 * <p><a id="ERR_INVALID_PACKAGE_TARGET"></a></p>
	 */
	ERR_INVALID_PACKAGE_CONFIG = 'ERR_INVALID_PACKAGE_CONFIG',
	/**
	 * <p>The <code>package.json</code> <a href="packages.html#exports"><code>"exports"</code></a> field contains an invalid target mapping
	 * value for the attempted module resolution.</p>
	 * <p><a id="ERR_INVALID_PROTOCOL"></a></p>
	 */
	ERR_INVALID_PACKAGE_TARGET = 'ERR_INVALID_PACKAGE_TARGET',
	/**
	 * <p>An invalid <code>options.protocol</code> was passed to <code>http.request()</code>.</p>
	 * <p><a id="ERR_INVALID_REPL_EVAL_CONFIG"></a></p>
	 */
	ERR_INVALID_PROTOCOL = 'ERR_INVALID_PROTOCOL',
	/**
	 * <p>Both <code>breakEvalOnSigint</code> and <code>eval</code> options were set in the <a href="repl.html"><code>REPL</code></a> config,
	 * which is not supported.</p>
	 * <p><a id="ERR_INVALID_REPL_INPUT"></a></p>
	 */
	ERR_INVALID_REPL_EVAL_CONFIG = 'ERR_INVALID_REPL_EVAL_CONFIG',
	/**
	 * <p>The input may not be used in the <a href="repl.html"><code>REPL</code></a>. The conditions under which this
	 * error is used are described in the <a href="repl.html"><code>REPL</code></a> documentation.</p>
	 * <p><a id="ERR_INVALID_RETURN_PROPERTY"></a></p>
	 */
	ERR_INVALID_REPL_INPUT = 'ERR_INVALID_REPL_INPUT',
	/**
	 * <p>Thrown in case a function option does not provide a valid value for one of its
	 * returned object properties on execution.</p>
	 * <p><a id="ERR_INVALID_RETURN_PROPERTY_VALUE"></a></p>
	 */
	ERR_INVALID_RETURN_PROPERTY = 'ERR_INVALID_RETURN_PROPERTY',
	/**
	 * <p>Thrown in case a function option does not provide an expected value
	 * type for one of its returned object properties on execution.</p>
	 * <p><a id="ERR_INVALID_RETURN_VALUE"></a></p>
	 */
	ERR_INVALID_RETURN_PROPERTY_VALUE = 'ERR_INVALID_RETURN_PROPERTY_VALUE',
	/**
	 * <p>Thrown in case a function option does not return an expected value
	 * type on execution, such as when a function is expected to return a promise.</p>
	 * <p><a id="ERR_INVALID_STATE"></a></p>
	 */
	ERR_INVALID_RETURN_VALUE = 'ERR_INVALID_RETURN_VALUE',
	/**
	 * <p>Indicates that an operation cannot be completed due to an invalid state.
	 * For instance, an object may have already been destroyed, or may be
	 * performing another operation.</p>
	 * <p><a id="ERR_INVALID_SYNC_FORK_INPUT"></a></p>
	 */
	ERR_INVALID_STATE = 'ERR_INVALID_STATE',
	/**
	 * <p>A <code>Buffer</code>, <code>TypedArray</code>, <code>DataView</code>, or <code>string</code> was provided as stdio input to
	 * an asynchronous fork. See the documentation for the <a href="child_process.html"><code>child_process</code></a> module
	 * for more information.</p>
	 * <p><a id="ERR_INVALID_THIS"></a></p>
	 */
	ERR_INVALID_SYNC_FORK_INPUT = 'ERR_INVALID_SYNC_FORK_INPUT',
	/**
	 * <p>A Node.js API function was called with an incompatible <code>this</code> value.</p>
	 * <pre><code class="language-js">const urlSearchParams = new URLSearchParams('foo=bar&#x26;baz=new');
	 * 
	 * const buf = Buffer.alloc(1);
	 * urlSearchParams.has.call(buf, 'foo');
	 * // Throws a TypeError with code 'ERR_INVALID_THIS'
	 * </code></pre>
	 * <p><a id="ERR_INVALID_TUPLE"></a></p>
	 */
	ERR_INVALID_THIS = 'ERR_INVALID_THIS',
	/**
	 * <p>An element in the <code>iterable</code> provided to the <a href="url.html#the-whatwg-url-api">WHATWG</a>
	 * <a href="url.html#new-urlsearchparamsiterable"><code>URLSearchParams</code> constructor</a> did not
	 * represent a <code>[name, value]</code> tuple – that is, if an element is not iterable, or
	 * does not consist of exactly two elements.</p>
	 * <p><a id="ERR_INVALID_TYPESCRIPT_SYNTAX"></a></p>
	 */
	ERR_INVALID_TUPLE = 'ERR_INVALID_TUPLE',
	/**
	 * <p>The provided TypeScript syntax is not valid.</p>
	 * <p><a id="ERR_INVALID_URI"></a></p>
	 */
	ERR_INVALID_TYPESCRIPT_SYNTAX = 'ERR_INVALID_TYPESCRIPT_SYNTAX',
	/**
	 * <p>An invalid URI was passed.</p>
	 * <p><a id="ERR_INVALID_URL"></a></p>
	 */
	ERR_INVALID_URI = 'ERR_INVALID_URI',
	/**
	 * <p>An invalid URL was passed to the <a href="url.html#the-whatwg-url-api">WHATWG</a> <a href="url.html#new-urlinput-base"><code>URL</code>
	 * constructor</a> or the legacy <a href="url.html#urlparseurlstring-parsequerystring-slashesdenotehost"><code>url.parse()</code></a> to be parsed.
	 * The thrown error object typically has an additional property <code>'input'</code> that
	 * contains the URL that failed to parse.</p>
	 * <p><a id="ERR_INVALID_URL_PATTERN"></a></p>
	 */
	ERR_INVALID_URL = 'ERR_INVALID_URL',
	/**
	 * <p>An invalid URLPattern was passed to the <a href="url.html#the-whatwg-url-api">WHATWG</a>
	 * <a href="url.html#new-urlpatternstring-baseurl-options"><code>URLPattern</code> constructor</a> to be parsed.</p>
	 * <p><a id="ERR_INVALID_URL_SCHEME"></a></p>
	 */
	ERR_INVALID_URL_PATTERN = 'ERR_INVALID_URL_PATTERN',
	/**
	 * <p>An attempt was made to use a URL of an incompatible scheme (protocol) for a
	 * specific purpose. It is only used in the <a href="url.html#the-whatwg-url-api">WHATWG URL API</a> support in the
	 * <a href="fs.html"><code>fs</code></a> module (which only accepts URLs with <code>'file'</code> scheme), but may be used
	 * in other Node.js APIs as well in the future.</p>
	 * <p><a id="ERR_IPC_CHANNEL_CLOSED"></a></p>
	 */
	ERR_INVALID_URL_SCHEME = 'ERR_INVALID_URL_SCHEME',
	/**
	 * <p>An attempt was made to use an IPC communication channel that was already closed.</p>
	 * <p><a id="ERR_IPC_DISCONNECTED"></a></p>
	 */
	ERR_IPC_CHANNEL_CLOSED = 'ERR_IPC_CHANNEL_CLOSED',
	/**
	 * <p>An attempt was made to disconnect an IPC communication channel that was already
	 * disconnected. See the documentation for the <a href="child_process.html"><code>child_process</code></a> module
	 * for more information.</p>
	 * <p><a id="ERR_IPC_ONE_PIPE"></a></p>
	 */
	ERR_IPC_DISCONNECTED = 'ERR_IPC_DISCONNECTED',
	/**
	 * <p>An attempt was made to create a child Node.js process using more than one IPC
	 * communication channel. See the documentation for the <a href="child_process.html"><code>child_process</code></a> module
	 * for more information.</p>
	 * <p><a id="ERR_IPC_SYNC_FORK"></a></p>
	 */
	ERR_IPC_ONE_PIPE = 'ERR_IPC_ONE_PIPE',
	/**
	 * <p>An attempt was made to open an IPC communication channel with a synchronously
	 * forked Node.js process. See the documentation for the <a href="child_process.html"><code>child_process</code></a> module
	 * for more information.</p>
	 * <p><a id="ERR_IP_BLOCKED"></a></p>
	 */
	ERR_IPC_SYNC_FORK = 'ERR_IPC_SYNC_FORK',
	/**
	 * <p>IP is blocked by <code>net.BlockList</code>.</p>
	 * <p><a id="ERR_LOADER_CHAIN_INCOMPLETE"></a></p>
	 */
	ERR_IP_BLOCKED = 'ERR_IP_BLOCKED',
	/**
	 * <p>An ESM loader hook returned without calling <code>next()</code> and without explicitly
	 * signaling a short circuit.</p>
	 * <p><a id="ERR_LOAD_SQLITE_EXTENSION"></a></p>
	 */
	ERR_LOADER_CHAIN_INCOMPLETE = 'ERR_LOADER_CHAIN_INCOMPLETE',
	/**
	 * <p>An error occurred while loading a SQLite extension.</p>
	 * <p><a id="ERR_MEMORY_ALLOCATION_FAILED"></a></p>
	 */
	ERR_LOAD_SQLITE_EXTENSION = 'ERR_LOAD_SQLITE_EXTENSION',
	/**
	 * <p>An attempt was made to allocate memory (usually in the C++ layer) but it
	 * failed.</p>
	 * <p><a id="ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE"></a></p>
	 */
	ERR_MEMORY_ALLOCATION_FAILED = 'ERR_MEMORY_ALLOCATION_FAILED',
	/**
	 * <p>A message posted to a <a href="worker_threads.html#class-messageport"><code>MessagePort</code></a> could not be deserialized in the target
	 * <a href="vm.html">vm</a> <code>Context</code>. Not all Node.js objects can be successfully instantiated in
	 * any context at this time, and attempting to transfer them using <code>postMessage()</code>
	 * can fail on the receiving side in that case.</p>
	 * <p><a id="ERR_METHOD_NOT_IMPLEMENTED"></a></p>
	 */
	ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE = 'ERR_MESSAGE_TARGET_CONTEXT_UNAVAILABLE',
	/**
	 * <p>A method is required but not implemented.</p>
	 * <p><a id="ERR_MISSING_ARGS"></a></p>
	 */
	ERR_METHOD_NOT_IMPLEMENTED = 'ERR_METHOD_NOT_IMPLEMENTED',
	/**
	 * <p>A required argument of a Node.js API was not passed. This is only used for
	 * strict compliance with the API specification (which in some cases may accept
	 * <code>func(undefined)</code> but not <code>func()</code>). In most native Node.js APIs,
	 * <code>func(undefined)</code> and <code>func()</code> are treated identically, and the
	 * <a href="#err_invalid_arg_type"><code>ERR_INVALID_ARG_TYPE</code></a> error code may be used instead.</p>
	 * <p><a id="ERR_MISSING_OPTION"></a></p>
	 */
	ERR_MISSING_ARGS = 'ERR_MISSING_ARGS',
	/**
	 * <p>For APIs that accept options objects, some options might be mandatory. This code
	 * is thrown if a required option is missing.</p>
	 * <p><a id="ERR_MISSING_PASSPHRASE"></a></p>
	 */
	ERR_MISSING_OPTION = 'ERR_MISSING_OPTION',
	/**
	 * <p>An attempt was made to read an encrypted key without specifying a passphrase.</p>
	 * <p><a id="ERR_MISSING_PLATFORM_FOR_WORKER"></a></p>
	 */
	ERR_MISSING_PASSPHRASE = 'ERR_MISSING_PASSPHRASE',
	/**
	 * <p>The V8 platform used by this instance of Node.js does not support creating
	 * Workers. This is caused by lack of embedder support for Workers. In particular,
	 * this error will not occur with standard builds of Node.js.</p>
	 * <p><a id="ERR_MODULE_LINK_MISMATCH"></a></p>
	 */
	ERR_MISSING_PLATFORM_FOR_WORKER = 'ERR_MISSING_PLATFORM_FOR_WORKER',
	/**
	 * <p>A module can not be linked because the same module requests in it are not
	 * resolved to the same module.</p>
	 * <p><a id="ERR_MODULE_NOT_FOUND"></a></p>
	 */
	ERR_MODULE_LINK_MISMATCH = 'ERR_MODULE_LINK_MISMATCH',
	/**
	 * <p>A module file could not be resolved by the ECMAScript modules loader while
	 * attempting an <code>import</code> operation or when loading the program entry point.</p>
	 * <p><a id="ERR_MULTIPLE_CALLBACK"></a></p>
	 */
	ERR_MODULE_NOT_FOUND = 'ERR_MODULE_NOT_FOUND',
	/**
	 * <p>A callback was called more than once.</p>
	 * <p>A callback is almost always meant to only be called once as the query
	 * can either be fulfilled or rejected but not both at the same time. The latter
	 * would be possible by calling a callback more than once.</p>
	 * <p><a id="ERR_NAPI_CONS_FUNCTION"></a></p>
	 */
	ERR_MULTIPLE_CALLBACK = 'ERR_MULTIPLE_CALLBACK',
	/**
	 * <p>While using <code>Node-API</code>, a constructor passed was not a function.</p>
	 * <p><a id="ERR_NAPI_INVALID_DATAVIEW_ARGS"></a></p>
	 */
	ERR_NAPI_CONS_FUNCTION = 'ERR_NAPI_CONS_FUNCTION',
	/**
	 * <p>While calling <code>napi_create_dataview()</code>, a given <code>offset</code> was outside the bounds
	 * of the dataview or <code>offset + length</code> was larger than a length of given <code>buffer</code>.</p>
	 * <p><a id="ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT"></a></p>
	 */
	ERR_NAPI_INVALID_DATAVIEW_ARGS = 'ERR_NAPI_INVALID_DATAVIEW_ARGS',
	/**
	 * <p>While calling <code>napi_create_typedarray()</code>, the provided <code>offset</code> was not a
	 * multiple of the element size.</p>
	 * <p><a id="ERR_NAPI_INVALID_TYPEDARRAY_LENGTH"></a></p>
	 */
	ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT = 'ERR_NAPI_INVALID_TYPEDARRAY_ALIGNMENT',
	/**
	 * <p>While calling <code>napi_create_typedarray()</code>, <code>(length * size_of_element) + byte_offset</code> was larger than the length of given <code>buffer</code>.</p>
	 * <p><a id="ERR_NAPI_TSFN_CALL_JS"></a></p>
	 */
	ERR_NAPI_INVALID_TYPEDARRAY_LENGTH = 'ERR_NAPI_INVALID_TYPEDARRAY_LENGTH',
	/**
	 * <p>An error occurred while invoking the JavaScript portion of the thread-safe
	 * function.</p>
	 * <p><a id="ERR_NAPI_TSFN_GET_UNDEFINED"></a></p>
	 */
	ERR_NAPI_TSFN_CALL_JS = 'ERR_NAPI_TSFN_CALL_JS',
	/**
	 * <p>An error occurred while attempting to retrieve the JavaScript <code>undefined</code>
	 * value.</p>
	 * <p><a id="ERR_NON_CONTEXT_AWARE_DISABLED"></a></p>
	 */
	ERR_NAPI_TSFN_GET_UNDEFINED = 'ERR_NAPI_TSFN_GET_UNDEFINED',
	/**
	 * <p>A non-context-aware native addon was loaded in a process that disallows them.</p>
	 * <p><a id="ERR_NOT_BUILDING_SNAPSHOT"></a></p>
	 */
	ERR_NON_CONTEXT_AWARE_DISABLED = 'ERR_NON_CONTEXT_AWARE_DISABLED',
	/**
	 * <p>An attempt was made to use operations that can only be used when building
	 * V8 startup snapshot even though Node.js isn't building one.</p>
	 * <p><a id="ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION"></a></p>
	 */
	ERR_NOT_BUILDING_SNAPSHOT = 'ERR_NOT_BUILDING_SNAPSHOT',
	/**
	 * <p>The operation cannot be performed when it's not in a single-executable
	 * application.</p>
	 * <p><a id="ERR_NOT_SUPPORTED_IN_SNAPSHOT"></a></p>
	 */
	ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION = 'ERR_NOT_IN_SINGLE_EXECUTABLE_APPLICATION',
	/**
	 * <p>An attempt was made to perform operations that are not supported when
	 * building a startup snapshot.</p>
	 * <p><a id="ERR_NO_CRYPTO"></a></p>
	 */
	ERR_NOT_SUPPORTED_IN_SNAPSHOT = 'ERR_NOT_SUPPORTED_IN_SNAPSHOT',
	/**
	 * <p>An attempt was made to use crypto features while Node.js was not compiled with
	 * OpenSSL crypto support.</p>
	 * <p><a id="ERR_NO_ICU"></a></p>
	 */
	ERR_NO_CRYPTO = 'ERR_NO_CRYPTO',
	/**
	 * <p>An attempt was made to use features that require <a href="intl.html#internationalization-support">ICU</a>, but Node.js was not
	 * compiled with ICU support.</p>
	 * <p><a id="ERR_NO_TYPESCRIPT"></a></p>
	 */
	ERR_NO_ICU = 'ERR_NO_ICU',
	/**
	 * <p>An attempt was made to use features that require <a href="typescript.html#type-stripping">Native TypeScript support</a>, but Node.js was not
	 * compiled with TypeScript support.</p>
	 * <p><a id="ERR_OPERATION_FAILED"></a></p>
	 */
	ERR_NO_TYPESCRIPT = 'ERR_NO_TYPESCRIPT',
	/**
	 * <p>An operation failed. This is typically used to signal the general failure
	 * of an asynchronous operation.</p>
	 * <p><a id="ERR_OPTIONS_BEFORE_BOOTSTRAPPING"></a></p>
	 */
	ERR_OPERATION_FAILED = 'ERR_OPERATION_FAILED',
	/**
	 * <p>An attempt was made to get options before the bootstrapping was completed.</p>
	 * <p><a id="ERR_OUT_OF_RANGE"></a></p>
	 */
	ERR_OPTIONS_BEFORE_BOOTSTRAPPING = 'ERR_OPTIONS_BEFORE_BOOTSTRAPPING',
	/**
	 * <p>A given value is out of the accepted range.</p>
	 * <p><a id="ERR_PACKAGE_IMPORT_NOT_DEFINED"></a></p>
	 */
	ERR_OUT_OF_RANGE = 'ERR_OUT_OF_RANGE',
	/**
	 * <p>The <code>package.json</code> <a href="packages.html#imports"><code>"imports"</code></a> field does not define the given internal
	 * package specifier mapping.</p>
	 * <p><a id="ERR_PACKAGE_PATH_NOT_EXPORTED"></a></p>
	 */
	ERR_PACKAGE_IMPORT_NOT_DEFINED = 'ERR_PACKAGE_IMPORT_NOT_DEFINED',
	/**
	 * <p>The <code>package.json</code> <a href="packages.html#exports"><code>"exports"</code></a> field does not export the requested subpath.
	 * Because exports are encapsulated, private internal modules that are not exported
	 * cannot be imported through the package resolution, unless using an absolute URL.</p>
	 * <p><a id="ERR_PARSE_ARGS_INVALID_OPTION_VALUE"></a></p>
	 */
	ERR_PACKAGE_PATH_NOT_EXPORTED = 'ERR_PACKAGE_PATH_NOT_EXPORTED',
	/**
	 * <p>When <code>strict</code> set to <code>true</code>, thrown by <a href="util.html#utilparseargsconfig"><code>util.parseArgs()</code></a> if a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type" class="type">&lt;boolean&gt;</a>
	 * value is provided for an option of type <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type" class="type">&lt;string&gt;</a>, or if a <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#string_type" class="type">&lt;string&gt;</a>
	 * value is provided for an option of type <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#boolean_type" class="type">&lt;boolean&gt;</a>.</p>
	 * <p><a id="ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL"></a></p>
	 */
	ERR_PARSE_ARGS_INVALID_OPTION_VALUE = 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE',
	/**
	 * <p>Thrown by <a href="util.html#utilparseargsconfig"><code>util.parseArgs()</code></a>, when a positional argument is provided and
	 * <code>allowPositionals</code> is set to <code>false</code>.</p>
	 * <p><a id="ERR_PARSE_ARGS_UNKNOWN_OPTION"></a></p>
	 */
	ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL = 'ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL',
	/**
	 * <p>When <code>strict</code> set to <code>true</code>, thrown by <a href="util.html#utilparseargsconfig"><code>util.parseArgs()</code></a> if an argument
	 * is not configured in <code>options</code>.</p>
	 * <p><a id="ERR_PERFORMANCE_INVALID_TIMESTAMP"></a></p>
	 */
	ERR_PARSE_ARGS_UNKNOWN_OPTION = 'ERR_PARSE_ARGS_UNKNOWN_OPTION',
	/**
	 * <p>An invalid timestamp value was provided for a performance mark or measure.</p>
	 * <p><a id="ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS"></a></p>
	 */
	ERR_PERFORMANCE_INVALID_TIMESTAMP = 'ERR_PERFORMANCE_INVALID_TIMESTAMP',
	/**
	 * <p>Invalid options were provided for a performance measure.</p>
	 * <p><a id="ERR_PROTO_ACCESS"></a></p>
	 */
	ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS = 'ERR_PERFORMANCE_MEASURE_INVALID_OPTIONS',
	/**
	 * <p>Accessing <code>Object.prototype.__proto__</code> has been forbidden using
	 * <a href="cli.html#--disable-protomode"><code>--disable-proto=throw</code></a>. <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf"><code>Object.getPrototypeOf</code></a> and
	 * <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/setPrototypeOf"><code>Object.setPrototypeOf</code></a> should be used to get and set the prototype of an
	 * object.</p>
	 * <p><a id="ERR_PROXY_INVALID_CONFIG"></a></p>
	 */
	ERR_PROTO_ACCESS = 'ERR_PROTO_ACCESS',
	/**
	 * <p>Failed to proxy a request because the proxy configuration is invalid.</p>
	 * <p><a id="ERR_PROXY_TUNNEL"></a></p>
	 */
	ERR_PROXY_INVALID_CONFIG = 'ERR_PROXY_INVALID_CONFIG',
	/**
	 * <p>Failed to establish proxy tunnel when <code>NODE_USE_ENV_PROXY</code> or <code>--use-env-proxy</code> is enabled.</p>
	 * <p><a id="ERR_QUIC_APPLICATION_ERROR"></a></p>
	 */
	ERR_PROXY_TUNNEL = 'ERR_PROXY_TUNNEL',
	/**
	 * <p>A QUIC application error occurred.</p>
	 * <p><a id="ERR_QUIC_CONNECTION_FAILED"></a></p>
	 */
	ERR_QUIC_APPLICATION_ERROR = 'ERR_QUIC_APPLICATION_ERROR',
	/**
	 * <p>Establishing a QUIC connection failed.</p>
	 * <p><a id="ERR_QUIC_ENDPOINT_CLOSED"></a></p>
	 */
	ERR_QUIC_CONNECTION_FAILED = 'ERR_QUIC_CONNECTION_FAILED',
	/**
	 * <p>A QUIC Endpoint closed with an error.</p>
	 * <p><a id="ERR_QUIC_OPEN_STREAM_FAILED"></a></p>
	 */
	ERR_QUIC_ENDPOINT_CLOSED = 'ERR_QUIC_ENDPOINT_CLOSED',
	/**
	 * <p>Opening a QUIC stream failed.</p>
	 * <p><a id="ERR_QUIC_TRANSPORT_ERROR"></a></p>
	 */
	ERR_QUIC_OPEN_STREAM_FAILED = 'ERR_QUIC_OPEN_STREAM_FAILED',
	/**
	 * <p>A QUIC transport error occurred.</p>
	 * <p><a id="ERR_QUIC_VERSION_NEGOTIATION_ERROR"></a></p>
	 */
	ERR_QUIC_TRANSPORT_ERROR = 'ERR_QUIC_TRANSPORT_ERROR',
	/**
	 * <p>A QUIC session failed because version negotiation is required.</p>
	 * <p><a id="ERR_REQUIRE_ASYNC_MODULE"></a></p>
	 */
	ERR_QUIC_VERSION_NEGOTIATION_ERROR = 'ERR_QUIC_VERSION_NEGOTIATION_ERROR',
	/**
	 * <p>When trying to <code>require()</code> a <a href="esm.html">ES Module</a>, the module turns out to be asynchronous.
	 * That is, it contains top-level await.</p>
	 * <p>To see where the top-level await is, use
	 * <code>--experimental-print-required-tla</code> (this would execute the modules
	 * before looking for the top-level awaits).</p>
	 * <p><a id="ERR_REQUIRE_CYCLE_MODULE"></a></p>
	 */
	ERR_REQUIRE_ASYNC_MODULE = 'ERR_REQUIRE_ASYNC_MODULE',
	/**
	 * <p>When trying to <code>require()</code> a <a href="esm.html">ES Module</a>, a CommonJS to ESM or ESM to CommonJS edge
	 * participates in an immediate cycle.
	 * This is not allowed because ES Modules cannot be evaluated while they are
	 * already being evaluated.</p>
	 * <p>To avoid the cycle, the <code>require()</code> call involved in a cycle should not happen
	 * at the top-level of either an ES Module (via <code>createRequire()</code>) or a CommonJS
	 * module, and should be done lazily in an inner function.</p>
	 * <p><a id="ERR_REQUIRE_ESM"></a></p>
	 */
	ERR_REQUIRE_CYCLE_MODULE = 'ERR_REQUIRE_CYCLE_MODULE',
	/**
	 * <p>An attempt was made to <code>require()</code> an <a href="esm.html">ES Module</a>.</p>
	 * <p>This error has been deprecated since <code>require()</code> now supports loading synchronous
	 * ES modules. When <code>require()</code> encounters an ES module that contains top-level
	 * <code>await</code>, it will throw <a href="#err_require_async_module"><code>ERR_REQUIRE_ASYNC_MODULE</code></a> instead.</p>
	 * <p><a id="ERR_SCRIPT_EXECUTION_INTERRUPTED"></a></p>
	 */
	ERR_REQUIRE_ESM = 'ERR_REQUIRE_ESM',
	/**
	 * <p>Script execution was interrupted by <code>SIGINT</code> (For
	 * example, <kbd>Ctrl</kbd>+<kbd>C</kbd> was pressed.)</p>
	 * <p><a id="ERR_SCRIPT_EXECUTION_TIMEOUT"></a></p>
	 */
	ERR_SCRIPT_EXECUTION_INTERRUPTED = 'ERR_SCRIPT_EXECUTION_INTERRUPTED',
	/**
	 * <p>Script execution timed out, possibly due to bugs in the script being executed.</p>
	 * <p><a id="ERR_SERVER_ALREADY_LISTEN"></a></p>
	 */
	ERR_SCRIPT_EXECUTION_TIMEOUT = 'ERR_SCRIPT_EXECUTION_TIMEOUT',
	/**
	 * <p>The <a href="net.html#serverlisten"><code>server.listen()</code></a> method was called while a <code>net.Server</code> was already
	 * listening. This applies to all instances of <code>net.Server</code>, including HTTP, HTTPS,
	 * and HTTP/2 <code>Server</code> instances.</p>
	 * <p><a id="ERR_SERVER_NOT_RUNNING"></a></p>
	 */
	ERR_SERVER_ALREADY_LISTEN = 'ERR_SERVER_ALREADY_LISTEN',
	/**
	 * <p>The <a href="net.html#serverclosecallback"><code>server.close()</code></a> method was called when a <code>net.Server</code> was not
	 * running. This applies to all instances of <code>net.Server</code>, including HTTP, HTTPS,
	 * and HTTP/2 <code>Server</code> instances.</p>
	 * <p><a id="ERR_SINGLE_EXECUTABLE_APPLICATION_ASSET_NOT_FOUND"></a></p>
	 */
	ERR_SERVER_NOT_RUNNING = 'ERR_SERVER_NOT_RUNNING',
	/**
	 * <p>A key was passed to single executable application APIs to identify an asset,
	 * but no match could be found.</p>
	 * <p><a id="ERR_SOCKET_ALREADY_BOUND"></a></p>
	 */
	ERR_SINGLE_EXECUTABLE_APPLICATION_ASSET_NOT_FOUND = 'ERR_SINGLE_EXECUTABLE_APPLICATION_ASSET_NOT_FOUND',
	/**
	 * <p>An attempt was made to bind a socket that has already been bound.</p>
	 * <p><a id="ERR_SOCKET_BAD_BUFFER_SIZE"></a></p>
	 */
	ERR_SOCKET_ALREADY_BOUND = 'ERR_SOCKET_ALREADY_BOUND',
	/**
	 * <p>An invalid (negative) size was passed for either the <code>recvBufferSize</code> or
	 * <code>sendBufferSize</code> options in <a href="dgram.html#dgramcreatesocketoptions-callback"><code>dgram.createSocket()</code></a>.</p>
	 * <p><a id="ERR_SOCKET_BAD_PORT"></a></p>
	 */
	ERR_SOCKET_BAD_BUFFER_SIZE = 'ERR_SOCKET_BAD_BUFFER_SIZE',
	/**
	 * <p>An API function expecting a port >= 0 and &#x3C; 65536 received an invalid value.</p>
	 * <p><a id="ERR_SOCKET_BAD_TYPE"></a></p>
	 */
	ERR_SOCKET_BAD_PORT = 'ERR_SOCKET_BAD_PORT',
	/**
	 * <p>An API function expecting a socket type (<code>udp4</code> or <code>udp6</code>) received an invalid
	 * value.</p>
	 * <p><a id="ERR_SOCKET_BUFFER_SIZE"></a></p>
	 */
	ERR_SOCKET_BAD_TYPE = 'ERR_SOCKET_BAD_TYPE',
	/**
	 * <p>While using <a href="dgram.html#dgramcreatesocketoptions-callback"><code>dgram.createSocket()</code></a>, the size of the receive or send <code>Buffer</code>
	 * could not be determined.</p>
	 * <p><a id="ERR_SOCKET_CLOSED"></a></p>
	 */
	ERR_SOCKET_BUFFER_SIZE = 'ERR_SOCKET_BUFFER_SIZE',
	/**
	 * <p>An attempt was made to operate on an already closed socket.</p>
	 * <p><a id="ERR_SOCKET_CLOSED_BEFORE_CONNECTION"></a></p>
	 */
	ERR_SOCKET_CLOSED = 'ERR_SOCKET_CLOSED',
	/**
	 * <p>When calling <a href="net.html#socketwritedata-encoding-callback"><code>net.Socket.write()</code></a> on a connecting socket and the socket was
	 * closed before the connection was established.</p>
	 * <p><a id="ERR_SOCKET_CONNECTION_TIMEOUT"></a></p>
	 */
	ERR_SOCKET_CLOSED_BEFORE_CONNECTION = 'ERR_SOCKET_CLOSED_BEFORE_CONNECTION',
	/**
	 * <p>The socket was unable to connect to any address returned by the DNS within the
	 * allowed timeout when using the family autoselection algorithm.</p>
	 * <p><a id="ERR_SOCKET_DGRAM_IS_CONNECTED"></a></p>
	 */
	ERR_SOCKET_CONNECTION_TIMEOUT = 'ERR_SOCKET_CONNECTION_TIMEOUT',
	/**
	 * <p>A <a href="dgram.html#socketconnectport-address-callback"><code>dgram.connect()</code></a> call was made on an already connected socket.</p>
	 * <p><a id="ERR_SOCKET_DGRAM_NOT_CONNECTED"></a></p>
	 */
	ERR_SOCKET_DGRAM_IS_CONNECTED = 'ERR_SOCKET_DGRAM_IS_CONNECTED',
	/**
	 * <p>A <a href="dgram.html#socketdisconnect"><code>dgram.disconnect()</code></a> or <a href="dgram.html#socketremoteaddress"><code>dgram.remoteAddress()</code></a> call was made on a
	 * disconnected socket.</p>
	 * <p><a id="ERR_SOCKET_DGRAM_NOT_RUNNING"></a></p>
	 */
	ERR_SOCKET_DGRAM_NOT_CONNECTED = 'ERR_SOCKET_DGRAM_NOT_CONNECTED',
	/**
	 * <p>A call was made and the UDP subsystem was not running.</p>
	 * <p><a id="ERR_SOURCE_MAP_CORRUPT"></a></p>
	 */
	ERR_SOCKET_DGRAM_NOT_RUNNING = 'ERR_SOCKET_DGRAM_NOT_RUNNING',
	/**
	 * <p>The source map could not be parsed because it does not exist, or is corrupt.</p>
	 * <p><a id="ERR_SOURCE_MAP_MISSING_SOURCE"></a></p>
	 */
	ERR_SOURCE_MAP_CORRUPT = 'ERR_SOURCE_MAP_CORRUPT',
	/**
	 * <p>A file imported from a source map was not found.</p>
	 * <p><a id="ERR_SOURCE_PHASE_NOT_DEFINED"></a></p>
	 */
	ERR_SOURCE_MAP_MISSING_SOURCE = 'ERR_SOURCE_MAP_MISSING_SOURCE',
	/**
	 * <p>The provided module import does not provide a source phase imports representation for source phase
	 * import syntax <code>import source x from 'x'</code> or <code>import.source(x)</code>.</p>
	 * <p><a id="ERR_SQLITE_ERROR"></a></p>
	 */
	ERR_SOURCE_PHASE_NOT_DEFINED = 'ERR_SOURCE_PHASE_NOT_DEFINED',
	/**
	 * <p>An error was returned from <a href="sqlite.html">SQLite</a>.</p>
	 * <p><a id="ERR_SRI_PARSE"></a></p>
	 */
	ERR_SQLITE_ERROR = 'ERR_SQLITE_ERROR',
	/**
	 * <p>A string was provided for a Subresource Integrity check, but was unable to be
	 * parsed. Check the format of integrity attributes by looking at the
	 * <a href="https://www.w3.org/TR/SRI/#the-integrity-attribute">Subresource Integrity specification</a>.</p>
	 * <p><a id="ERR_STREAM_ALREADY_FINISHED"></a></p>
	 */
	ERR_SRI_PARSE = 'ERR_SRI_PARSE',
	/**
	 * <p>A stream method was called that cannot complete because the stream was
	 * finished.</p>
	 * <p><a id="ERR_STREAM_CANNOT_PIPE"></a></p>
	 */
	ERR_STREAM_ALREADY_FINISHED = 'ERR_STREAM_ALREADY_FINISHED',
	/**
	 * <p>An attempt was made to call <a href="stream.html#readablepipedestination-options"><code>stream.pipe()</code></a> on a <a href="stream.html#class-streamwritable"><code>Writable</code></a> stream.</p>
	 * <p><a id="ERR_STREAM_DESTROYED"></a></p>
	 */
	ERR_STREAM_CANNOT_PIPE = 'ERR_STREAM_CANNOT_PIPE',
	/**
	 * <p>A stream method was called that cannot complete because the stream was
	 * destroyed using <code>stream.destroy()</code>.</p>
	 * <p><a id="ERR_STREAM_NULL_VALUES"></a></p>
	 */
	ERR_STREAM_DESTROYED = 'ERR_STREAM_DESTROYED',
	/**
	 * <p>An attempt was made to call <a href="stream.html#writablewritechunk-encoding-callback"><code>stream.write()</code></a> with a <code>null</code> chunk.</p>
	 * <p><a id="ERR_STREAM_PREMATURE_CLOSE"></a></p>
	 */
	ERR_STREAM_NULL_VALUES = 'ERR_STREAM_NULL_VALUES',
	/**
	 * <p>An error returned by <code>stream.finished()</code> and <code>stream.pipeline()</code>, when a stream
	 * or a pipeline ends non gracefully with no explicit error.</p>
	 * <p><a id="ERR_STREAM_PUSH_AFTER_EOF"></a></p>
	 */
	ERR_STREAM_PREMATURE_CLOSE = 'ERR_STREAM_PREMATURE_CLOSE',
	/**
	 * <p>An attempt was made to call <a href="stream.html#readablepushchunk-encoding"><code>stream.push()</code></a> after a <code>null</code>(EOF) had been
	 * pushed to the stream.</p>
	 * <p><a id="ERR_STREAM_UNABLE_TO_PIPE"></a></p>
	 */
	ERR_STREAM_PUSH_AFTER_EOF = 'ERR_STREAM_PUSH_AFTER_EOF',
	/**
	 * <p>An attempt was made to pipe to a closed or destroyed stream in a pipeline.</p>
	 * <p><a id="ERR_STREAM_UNSHIFT_AFTER_END_EVENT"></a></p>
	 */
	ERR_STREAM_UNABLE_TO_PIPE = 'ERR_STREAM_UNABLE_TO_PIPE',
	/**
	 * <p>An attempt was made to call <a href="stream.html#readableunshiftchunk-encoding"><code>stream.unshift()</code></a> after the <code>'end'</code> event was
	 * emitted.</p>
	 * <p><a id="ERR_STREAM_WRAP"></a></p>
	 */
	ERR_STREAM_UNSHIFT_AFTER_END_EVENT = 'ERR_STREAM_UNSHIFT_AFTER_END_EVENT',
	/**
	 * <p>Prevents an abort if a string decoder was set on the Socket or if the decoder
	 * is in <code>objectMode</code>.</p>
	 * <pre><code class="language-js">const Socket = require('node:net').Socket;
	 * const instance = new Socket();
	 * 
	 * instance.setEncoding('utf8');
	 * </code></pre>
	 * <p><a id="ERR_STREAM_WRITE_AFTER_END"></a></p>
	 */
	ERR_STREAM_WRAP = 'ERR_STREAM_WRAP',
	/**
	 * <p>An attempt was made to call <a href="stream.html#writablewritechunk-encoding-callback"><code>stream.write()</code></a> after <code>stream.end()</code> has been
	 * called.</p>
	 * <p><a id="ERR_STRING_TOO_LONG"></a></p>
	 */
	ERR_STREAM_WRITE_AFTER_END = 'ERR_STREAM_WRITE_AFTER_END',
	/**
	 * <p>An attempt has been made to create a string longer than the maximum allowed
	 * length.</p>
	 * <p><a id="ERR_SYNTHETIC"></a></p>
	 */
	ERR_STRING_TOO_LONG = 'ERR_STRING_TOO_LONG',
	/**
	 * <p>An artificial error object used to capture the call stack for diagnostic
	 * reports.</p>
	 * <p><a id="ERR_SYSTEM_ERROR"></a></p>
	 */
	ERR_SYNTHETIC = 'ERR_SYNTHETIC',
	/**
	 * <p>An unspecified or non-specific system error has occurred within the Node.js
	 * process. The error object will have an <code>err.info</code> object property with
	 * additional details.</p>
	 * <p><a id="ERR_TEST_FAILURE"></a></p>
	 */
	ERR_SYSTEM_ERROR = 'ERR_SYSTEM_ERROR',
	/**
	 * <p>This error represents a failed test. Additional information about the failure
	 * is available via the <code>cause</code> property. The <code>failureType</code> property specifies
	 * what the test was doing when the failure occurred.</p>
	 * <p><a id="ERR_TLS_ALPN_CALLBACK_INVALID_RESULT"></a></p>
	 */
	ERR_TEST_FAILURE = 'ERR_TEST_FAILURE',
	/**
	 * <p>This error is thrown when an <code>ALPNCallback</code> returns a value that is not in the
	 * list of ALPN protocols offered by the client.</p>
	 * <p><a id="ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS"></a></p>
	 */
	ERR_TLS_ALPN_CALLBACK_INVALID_RESULT = 'ERR_TLS_ALPN_CALLBACK_INVALID_RESULT',
	/**
	 * <p>This error is thrown when creating a <code>TLSServer</code> if the TLS options include
	 * both <code>ALPNProtocols</code> and <code>ALPNCallback</code>. These options are mutually exclusive.</p>
	 * <p><a id="ERR_TLS_CERT_ALTNAME_FORMAT"></a></p>
	 */
	ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS = 'ERR_TLS_ALPN_CALLBACK_WITH_PROTOCOLS',
	/**
	 * <p>This error is thrown by <code>checkServerIdentity</code> if a user-supplied
	 * <code>subjectaltname</code> property violates encoding rules. Certificate objects produced
	 * by Node.js itself always comply with encoding rules and will never cause
	 * this error.</p>
	 * <p><a id="ERR_TLS_CERT_ALTNAME_INVALID"></a></p>
	 */
	ERR_TLS_CERT_ALTNAME_FORMAT = 'ERR_TLS_CERT_ALTNAME_FORMAT',
	/**
	 * <p>While using TLS, the host name/IP of the peer did not match any of the
	 * <code>subjectAltNames</code> in its certificate.</p>
	 * <p><a id="ERR_TLS_DH_PARAM_SIZE"></a></p>
	 */
	ERR_TLS_CERT_ALTNAME_INVALID = 'ERR_TLS_CERT_ALTNAME_INVALID',
	/**
	 * <p>While using TLS, the parameter offered for the Diffie-Hellman (<code>DH</code>)
	 * key-agreement protocol is too small. By default, the key length must be greater
	 * than or equal to 1024 bits to avoid vulnerabilities, even though it is strongly
	 * recommended to use 2048 bits or larger for stronger security.</p>
	 * <p><a id="ERR_TLS_HANDSHAKE_TIMEOUT"></a></p>
	 */
	ERR_TLS_DH_PARAM_SIZE = 'ERR_TLS_DH_PARAM_SIZE',
	/**
	 * <p>A TLS/SSL handshake timed out. In this case, the server must also abort the
	 * connection.</p>
	 * <p><a id="ERR_TLS_INVALID_CONTEXT"></a></p>
	 */
	ERR_TLS_HANDSHAKE_TIMEOUT = 'ERR_TLS_HANDSHAKE_TIMEOUT',
	/**
	 * <p>The context must be a <code>SecureContext</code>.</p>
	 * <p><a id="ERR_TLS_INVALID_PROTOCOL_METHOD"></a></p>
	 */
	ERR_TLS_INVALID_CONTEXT = 'ERR_TLS_INVALID_CONTEXT',
	/**
	 * <p>The specified  <code>secureProtocol</code> method is invalid. It is  either unknown, or
	 * disabled because it is insecure.</p>
	 * <p><a id="ERR_TLS_INVALID_PROTOCOL_VERSION"></a></p>
	 */
	ERR_TLS_INVALID_PROTOCOL_METHOD = 'ERR_TLS_INVALID_PROTOCOL_METHOD',
	/**
	 * <p>Valid TLS protocol versions are <code>'TLSv1'</code>, <code>'TLSv1.1'</code>, or <code>'TLSv1.2'</code>.</p>
	 * <p><a id="ERR_TLS_INVALID_STATE"></a></p>
	 */
	ERR_TLS_INVALID_PROTOCOL_VERSION = 'ERR_TLS_INVALID_PROTOCOL_VERSION',
	/**
	 * <p>The TLS socket must be connected and securely established. Ensure the 'secure'
	 * event is emitted before continuing.</p>
	 * <p><a id="ERR_TLS_PROTOCOL_VERSION_CONFLICT"></a></p>
	 */
	ERR_TLS_INVALID_STATE = 'ERR_TLS_INVALID_STATE',
	/**
	 * <p>Attempting to set a TLS protocol <code>minVersion</code> or <code>maxVersion</code> conflicts with an
	 * attempt to set the <code>secureProtocol</code> explicitly. Use one mechanism or the other.</p>
	 * <p><a id="ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED"></a></p>
	 */
	ERR_TLS_PROTOCOL_VERSION_CONFLICT = 'ERR_TLS_PROTOCOL_VERSION_CONFLICT',
	/**
	 * <p>Failed to set PSK identity hint. Hint may be too long.</p>
	 * <p><a id="ERR_TLS_RENEGOTIATION_DISABLED"></a></p>
	 */
	ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED = 'ERR_TLS_PSK_SET_IDENTITY_HINT_FAILED',
	/**
	 * <p>An attempt was made to renegotiate TLS on a socket instance with renegotiation
	 * disabled.</p>
	 * <p><a id="ERR_TLS_REQUIRED_SERVER_NAME"></a></p>
	 */
	ERR_TLS_RENEGOTIATION_DISABLED = 'ERR_TLS_RENEGOTIATION_DISABLED',
	/**
	 * <p>While using TLS, the <code>server.addContext()</code> method was called without providing
	 * a host name in the first parameter.</p>
	 * <p><a id="ERR_TLS_SESSION_ATTACK"></a></p>
	 */
	ERR_TLS_REQUIRED_SERVER_NAME = 'ERR_TLS_REQUIRED_SERVER_NAME',
	/**
	 * <p>An excessive amount of TLS renegotiations is detected, which is a potential
	 * vector for denial-of-service attacks.</p>
	 * <p><a id="ERR_TLS_SNI_FROM_SERVER"></a></p>
	 */
	ERR_TLS_SESSION_ATTACK = 'ERR_TLS_SESSION_ATTACK',
	/**
	 * <p>An attempt was made to issue Server Name Indication from a TLS server-side
	 * socket, which is only valid from a client.</p>
	 * <p><a id="ERR_TRACE_EVENTS_CATEGORY_REQUIRED"></a></p>
	 */
	ERR_TLS_SNI_FROM_SERVER = 'ERR_TLS_SNI_FROM_SERVER',
	/**
	 * <p>The <code>trace_events.createTracing()</code> method requires at least one trace event
	 * category.</p>
	 * <p><a id="ERR_TRACE_EVENTS_UNAVAILABLE"></a></p>
	 */
	ERR_TRACE_EVENTS_CATEGORY_REQUIRED = 'ERR_TRACE_EVENTS_CATEGORY_REQUIRED',
	/**
	 * <p>The <code>node:trace_events</code> module could not be loaded because Node.js was compiled
	 * with the <code>--without-v8-platform</code> flag.</p>
	 * <p><a id="ERR_TRAILING_JUNK_AFTER_STREAM_END"></a></p>
	 */
	ERR_TRACE_EVENTS_UNAVAILABLE = 'ERR_TRACE_EVENTS_UNAVAILABLE',
	/**
	 * <p>Trailing junk found after the end of the compressed stream.
	 * This error is thrown when extra, unexpected data is detected
	 * after the end of a compressed stream (for example, in zlib
	 * or gzip decompression).</p>
	 * <p><a id="ERR_TRANSFORM_ALREADY_TRANSFORMING"></a></p>
	 */
	ERR_TRAILING_JUNK_AFTER_STREAM_END = 'ERR_TRAILING_JUNK_AFTER_STREAM_END',
	/**
	 * <p>A <code>Transform</code> stream finished while it was still transforming.</p>
	 * <p><a id="ERR_TRANSFORM_WITH_LENGTH_0"></a></p>
	 */
	ERR_TRANSFORM_ALREADY_TRANSFORMING = 'ERR_TRANSFORM_ALREADY_TRANSFORMING',
	/**
	 * <p>A <code>Transform</code> stream finished with data still in the write buffer.</p>
	 * <p><a id="ERR_TTY_INIT_FAILED"></a></p>
	 */
	ERR_TRANSFORM_WITH_LENGTH_0 = 'ERR_TRANSFORM_WITH_LENGTH_0',
	/**
	 * <p>The initialization of a TTY failed due to a system error.</p>
	 * <p><a id="ERR_UNAVAILABLE_DURING_EXIT"></a></p>
	 */
	ERR_TTY_INIT_FAILED = 'ERR_TTY_INIT_FAILED',
	/**
	 * <p>Function was called within a <a href="process.html#event-exit"><code>process.on('exit')</code></a> handler that shouldn't be
	 * called within <a href="process.html#event-exit"><code>process.on('exit')</code></a> handler.</p>
	 * <p><a id="ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET"></a></p>
	 */
	ERR_UNAVAILABLE_DURING_EXIT = 'ERR_UNAVAILABLE_DURING_EXIT',
	/**
	 * <p><a href="process.html#processsetuncaughtexceptioncapturecallbackfn"><code>process.setUncaughtExceptionCaptureCallback()</code></a> was called twice,
	 * without first resetting the callback to <code>null</code>.</p>
	 * <p>This error is designed to prevent accidentally overwriting a callback registered
	 * from another module.</p>
	 * <p><a id="ERR_UNESCAPED_CHARACTERS"></a></p>
	 */
	ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET = 'ERR_UNCAUGHT_EXCEPTION_CAPTURE_ALREADY_SET',
	/**
	 * <p>A string that contained unescaped characters was received.</p>
	 * <p><a id="ERR_UNHANDLED_ERROR"></a></p>
	 */
	ERR_UNESCAPED_CHARACTERS = 'ERR_UNESCAPED_CHARACTERS',
	/**
	 * <p>An unhandled error occurred (for instance, when an <code>'error'</code> event is emitted
	 * by an <a href="events.html#class-eventemitter"><code>EventEmitter</code></a> but an <code>'error'</code> handler is not registered).</p>
	 * <p><a id="ERR_UNKNOWN_BUILTIN_MODULE"></a></p>
	 */
	ERR_UNHANDLED_ERROR = 'ERR_UNHANDLED_ERROR',
	/**
	 * <p>Used to identify a specific kind of internal Node.js error that should not
	 * typically be triggered by user code. Instances of this error point to an
	 * internal bug within the Node.js binary itself.</p>
	 * <p><a id="ERR_UNKNOWN_CREDENTIAL"></a></p>
	 */
	ERR_UNKNOWN_BUILTIN_MODULE = 'ERR_UNKNOWN_BUILTIN_MODULE',
	/**
	 * <p>A Unix group or user identifier that does not exist was passed.</p>
	 * <p><a id="ERR_UNKNOWN_ENCODING"></a></p>
	 */
	ERR_UNKNOWN_CREDENTIAL = 'ERR_UNKNOWN_CREDENTIAL',
	/**
	 * <p>An invalid or unknown encoding option was passed to an API.</p>
	 * <p><a id="ERR_UNKNOWN_FILE_EXTENSION"></a></p>
	 */
	ERR_UNKNOWN_ENCODING = 'ERR_UNKNOWN_ENCODING',
	/**
	 * <p>An attempt was made to load a module with an unknown or unsupported file
	 * extension.</p>
	 * <p><a id="ERR_UNKNOWN_MODULE_FORMAT"></a></p>
	 */
	ERR_UNKNOWN_FILE_EXTENSION = 'ERR_UNKNOWN_FILE_EXTENSION',
	/**
	 * <p>An attempt was made to load a module with an unknown or unsupported format.</p>
	 * <p><a id="ERR_UNKNOWN_SIGNAL"></a></p>
	 */
	ERR_UNKNOWN_MODULE_FORMAT = 'ERR_UNKNOWN_MODULE_FORMAT',
	/**
	 * <p>An invalid or unknown process signal was passed to an API expecting a valid
	 * signal (such as <a href="child_process.html#subprocesskillsignal"><code>subprocess.kill()</code></a>).</p>
	 * <p><a id="ERR_UNSUPPORTED_DIR_IMPORT"></a></p>
	 */
	ERR_UNKNOWN_SIGNAL = 'ERR_UNKNOWN_SIGNAL',
	/**
	 * <p><code>import</code> a directory URL is unsupported. Instead,
	 * <a href="packages.html#self-referencing-a-package-using-its-name">self-reference a package using its name</a> and <a href="packages.html#subpath-exports">define a custom subpath</a> in
	 * the <a href="packages.html#exports"><code>"exports"</code></a> field of the <a href="packages.html#nodejs-packagejson-field-definitions"><code>package.json</code></a> file.</p>
	 * <pre><code class="language-mjs">import './'; // unsupported
	 * import './index.js'; // supported
	 * import 'package-name'; // supported
	 * </code></pre>
	 * <p><a id="ERR_UNSUPPORTED_ESM_URL_SCHEME"></a></p>
	 */
	ERR_UNSUPPORTED_DIR_IMPORT = 'ERR_UNSUPPORTED_DIR_IMPORT',
	/**
	 * <p><code>import</code> with URL schemes other than <code>file</code> and <code>data</code> is unsupported.</p>
	 * <p><a id="ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING"></a></p>
	 */
	ERR_UNSUPPORTED_ESM_URL_SCHEME = 'ERR_UNSUPPORTED_ESM_URL_SCHEME',
	/**
	 * <p>Type stripping is not supported for files descendent of a <code>node_modules</code> directory.</p>
	 * <p><a id="ERR_UNSUPPORTED_RESOLVE_REQUEST"></a></p>
	 */
	ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING = 'ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING',
	/**
	 * <p>An attempt was made to resolve an invalid module referrer. This can happen when
	 * importing or calling <code>import.meta.resolve()</code> with either:</p>
	 * <ul>
	 * <li>a bare specifier that is not a builtin module from a module whose URL scheme
	 * is not <code>file</code>.</li>
	 * <li>a <a href="https://url.spec.whatwg.org/#relative-url-string">relative URL</a> from a module whose URL scheme is not a <a href="https://url.spec.whatwg.org/#special-scheme">special scheme</a>.</li>
	 * </ul>
	 * <pre><code class="language-mjs">try {
	 *   // Trying to import the package 'bare-specifier' from a `data:` URL module:
	 *   await import('data:text/javascript,import "bare-specifier"');
	 * } catch (e) {
	 *   console.log(e.code); // ERR_UNSUPPORTED_RESOLVE_REQUEST
	 * }
	 * </code></pre>
	 * <p><a id="ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX"></a></p>
	 */
	ERR_UNSUPPORTED_RESOLVE_REQUEST = 'ERR_UNSUPPORTED_RESOLVE_REQUEST',
	/**
	 * <p>The provided TypeScript syntax is unsupported.
	 * This could happen when using TypeScript syntax that requires
	 * transformation with <a href="typescript.html#type-stripping">type-stripping</a>.</p>
	 * <p><a id="ERR_USE_AFTER_CLOSE"></a></p>
	 */
	ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX = 'ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX',
	/**
	 * <p>An attempt was made to use something that was already closed.</p>
	 * <p><a id="ERR_VALID_PERFORMANCE_ENTRY_TYPE"></a></p>
	 */
	ERR_USE_AFTER_CLOSE = 'ERR_USE_AFTER_CLOSE',
	/**
	 * <p>While using the Performance Timing API (<code>perf_hooks</code>), no valid performance
	 * entry types are found.</p>
	 * <p><a id="ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING"></a></p>
	 */
	ERR_VALID_PERFORMANCE_ENTRY_TYPE = 'ERR_VALID_PERFORMANCE_ENTRY_TYPE',
	/**
	 * <p>A dynamic import callback was not specified.</p>
	 * <p><a id="ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG"></a></p>
	 */
	ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING = 'ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING',
	/**
	 * <p>A dynamic import callback was invoked without <code>--experimental-vm-modules</code>.</p>
	 * <p><a id="ERR_VM_MODULE_ALREADY_LINKED"></a></p>
	 */
	ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG = 'ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING_FLAG',
	/**
	 * <p>The module attempted to be linked is not eligible for linking, because of one of
	 * the following reasons:</p>
	 * <ul>
	 * <li>It has already been linked (<code>linkingStatus</code> is <code>'linked'</code>)</li>
	 * <li>It is being linked (<code>linkingStatus</code> is <code>'linking'</code>)</li>
	 * <li>Linking has failed for this module (<code>linkingStatus</code> is <code>'errored'</code>)</li>
	 * </ul>
	 * <p><a id="ERR_VM_MODULE_CACHED_DATA_REJECTED"></a></p>
	 */
	ERR_VM_MODULE_ALREADY_LINKED = 'ERR_VM_MODULE_ALREADY_LINKED',
	/**
	 * <p>The <code>cachedData</code> option passed to a module constructor is invalid.</p>
	 * <p><a id="ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA"></a></p>
	 */
	ERR_VM_MODULE_CACHED_DATA_REJECTED = 'ERR_VM_MODULE_CACHED_DATA_REJECTED',
	/**
	 * <p>Cached data cannot be created for modules which have already been evaluated.</p>
	 * <p><a id="ERR_VM_MODULE_DIFFERENT_CONTEXT"></a></p>
	 */
	ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA = 'ERR_VM_MODULE_CANNOT_CREATE_CACHED_DATA',
	/**
	 * <p>The module being returned from the linker function is from a different context
	 * than the parent module. Linked modules must share the same context.</p>
	 * <p><a id="ERR_VM_MODULE_LINK_FAILURE"></a></p>
	 */
	ERR_VM_MODULE_DIFFERENT_CONTEXT = 'ERR_VM_MODULE_DIFFERENT_CONTEXT',
	/**
	 * <p>The module was unable to be linked due to a failure.</p>
	 * <p><a id="ERR_VM_MODULE_NOT_MODULE"></a></p>
	 */
	ERR_VM_MODULE_LINK_FAILURE = 'ERR_VM_MODULE_LINK_FAILURE',
	/**
	 * <p>The fulfilled value of a linking promise is not a <code>vm.Module</code> object.</p>
	 * <p><a id="ERR_VM_MODULE_STATUS"></a></p>
	 */
	ERR_VM_MODULE_NOT_MODULE = 'ERR_VM_MODULE_NOT_MODULE',
	/**
	 * <p>The current module's status does not allow for this operation. The specific
	 * meaning of the error depends on the specific function.</p>
	 * <p><a id="ERR_WASI_ALREADY_STARTED"></a></p>
	 */
	ERR_VM_MODULE_STATUS = 'ERR_VM_MODULE_STATUS',
	/**
	 * <p>The WASI instance has already started.</p>
	 * <p><a id="ERR_WASI_NOT_STARTED"></a></p>
	 */
	ERR_WASI_ALREADY_STARTED = 'ERR_WASI_ALREADY_STARTED',
	/**
	 * <p>The WASI instance has not been started.</p>
	 * <p><a id="ERR_WEBASSEMBLY_RESPONSE"></a></p>
	 */
	ERR_WASI_NOT_STARTED = 'ERR_WASI_NOT_STARTED',
	/**
	 * <p>The <code>Response</code> that has been passed to <code>WebAssembly.compileStreaming</code> or to
	 * <code>WebAssembly.instantiateStreaming</code> is not a valid WebAssembly response.</p>
	 * <p><a id="ERR_WORKER_INIT_FAILED"></a></p>
	 */
	ERR_WEBASSEMBLY_RESPONSE = 'ERR_WEBASSEMBLY_RESPONSE',
	/**
	 * <p>The <code>Worker</code> initialization failed.</p>
	 * <p><a id="ERR_WORKER_INVALID_EXEC_ARGV"></a></p>
	 */
	ERR_WORKER_INIT_FAILED = 'ERR_WORKER_INIT_FAILED',
	/**
	 * <p>The <code>execArgv</code> option passed to the <code>Worker</code> constructor contains
	 * invalid flags.</p>
	 * <p><a id="ERR_WORKER_MESSAGING_ERRORED"></a></p>
	 */
	ERR_WORKER_INVALID_EXEC_ARGV = 'ERR_WORKER_INVALID_EXEC_ARGV',
	/**
	 * <p>The destination thread threw an error while processing a message sent via <a href="worker_threads.html#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout"><code>postMessageToThread()</code></a>.</p>
	 * <p><a id="ERR_WORKER_MESSAGING_FAILED"></a></p>
	 */
	ERR_WORKER_MESSAGING_ERRORED = 'ERR_WORKER_MESSAGING_ERRORED',
	/**
	 * <p>The thread requested in <a href="worker_threads.html#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout"><code>postMessageToThread()</code></a> is invalid or has no <code>workerMessage</code> listener.</p>
	 * <p><a id="ERR_WORKER_MESSAGING_SAME_THREAD"></a></p>
	 */
	ERR_WORKER_MESSAGING_FAILED = 'ERR_WORKER_MESSAGING_FAILED',
	/**
	 * <p>The thread id requested in <a href="worker_threads.html#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout"><code>postMessageToThread()</code></a> is the current thread id.</p>
	 * <p><a id="ERR_WORKER_MESSAGING_TIMEOUT"></a></p>
	 */
	ERR_WORKER_MESSAGING_SAME_THREAD = 'ERR_WORKER_MESSAGING_SAME_THREAD',
	/**
	 * <p>Sending a message via <a href="worker_threads.html#worker_threadspostmessagetothreadthreadid-value-transferlist-timeout"><code>postMessageToThread()</code></a> timed out.</p>
	 * <p><a id="ERR_WORKER_NOT_RUNNING"></a></p>
	 */
	ERR_WORKER_MESSAGING_TIMEOUT = 'ERR_WORKER_MESSAGING_TIMEOUT',
	/**
	 * <p>An operation failed because the <code>Worker</code> instance is not currently running.</p>
	 * <p><a id="ERR_WORKER_OUT_OF_MEMORY"></a></p>
	 */
	ERR_WORKER_NOT_RUNNING = 'ERR_WORKER_NOT_RUNNING',
	/**
	 * <p>The <code>Worker</code> instance terminated because it reached its memory limit.</p>
	 * <p><a id="ERR_WORKER_PATH"></a></p>
	 */
	ERR_WORKER_OUT_OF_MEMORY = 'ERR_WORKER_OUT_OF_MEMORY',
	/**
	 * <p>The path for the main script of a worker is neither an absolute path
	 * nor a relative path starting with <code>./</code> or <code>../</code>.</p>
	 * <p><a id="ERR_WORKER_UNSERIALIZABLE_ERROR"></a></p>
	 */
	ERR_WORKER_PATH = 'ERR_WORKER_PATH',
	/**
	 * <p>All attempts at serializing an uncaught exception from a worker thread failed.</p>
	 * <p><a id="ERR_WORKER_UNSUPPORTED_OPERATION"></a></p>
	 */
	ERR_WORKER_UNSERIALIZABLE_ERROR = 'ERR_WORKER_UNSERIALIZABLE_ERROR',
	/**
	 * <p>The requested functionality is not supported in worker threads.</p>
	 * <p><a id="ERR_ZLIB_INITIALIZATION_FAILED"></a></p>
	 */
	ERR_WORKER_UNSUPPORTED_OPERATION = 'ERR_WORKER_UNSUPPORTED_OPERATION',
	/**
	 * <p>Creation of a <a href="zlib.html"><code>zlib</code></a> object failed due to incorrect configuration.</p>
	 * <p><a id="ERR_ZSTD_INVALID_PARAM"></a></p>
	 */
	ERR_ZLIB_INITIALIZATION_FAILED = 'ERR_ZLIB_INITIALIZATION_FAILED',
	/**
	 * <p>An invalid parameter key was passed during construction of a Zstd stream.</p>
	 * <p><a id="HPE_CHUNK_EXTENSIONS_OVERFLOW"></a></p>
	 */
	ERR_ZSTD_INVALID_PARAM = 'ERR_ZSTD_INVALID_PARAM',
	/**
	 * <p>Too much data was received for a chunk extensions. In order to protect against
	 * malicious or malconfigured clients, if more than 16 KiB of data is received
	 * then an <code>Error</code> with this code will be emitted.</p>
	 * <p><a id="HPE_HEADER_OVERFLOW"></a></p>
	 */
	HPE_CHUNK_EXTENSIONS_OVERFLOW = 'HPE_CHUNK_EXTENSIONS_OVERFLOW',
	/**
	 * <p>Too much HTTP header data was received. In order to protect against malicious or
	 * malconfigured clients, if more than <code>maxHeaderSize</code> of HTTP header data is received then
	 * HTTP parsing will abort without a request or response object being created, and
	 * an <code>Error</code> with this code will be emitted.</p>
	 * <p><a id="HPE_UNEXPECTED_CONTENT_LENGTH"></a></p>
	 */
	HPE_HEADER_OVERFLOW = 'HPE_HEADER_OVERFLOW',
	/**
	 * <p>Server is sending both a <code>Content-Length</code> header and <code>Transfer-Encoding: chunked</code>.</p>
	 * <p><code>Transfer-Encoding: chunked</code> allows the server to maintain an HTTP persistent
	 * connection for dynamically generated content.
	 * In this case, the <code>Content-Length</code> HTTP header cannot be used.</p>
	 * <p>Use <code>Content-Length</code> or <code>Transfer-Encoding: chunked</code>.</p>
	 * <p><a id="MODULE_NOT_FOUND"></a></p>
	 */
	HPE_UNEXPECTED_CONTENT_LENGTH = 'HPE_UNEXPECTED_CONTENT_LENGTH',
	/**
	 * <p>A module file could not be resolved by the CommonJS modules loader while
	 * attempting a <a href="modules.html#requireid"><code>require()</code></a> operation or when loading the program entry point.</p>
	 */
	MODULE_NOT_FOUND = 'MODULE_NOT_FOUND',

	/**
	 * <p>The value passed to <code>postMessage()</code> contained an object that is not supported
	 * for transferring.</p>
	 * <p><a id="ERR_CPU_USAGE"></a></p>
	 * @deprecated
	 */
	ERR_CANNOT_TRANSFER_OBJECT = 'ERR_CANNOT_TRANSFER_OBJECT',
	/**
	 * <p>The native call from <code>process.cpuUsage</code> could not be processed.</p>
	 * <p><a id="ERR_CRYPTO_HASH_DIGEST_NO_UTF16"></a></p>
	 * @deprecated
	 */
	ERR_CPU_USAGE = 'ERR_CPU_USAGE',
	/**
	 * <p>The UTF-16 encoding was used with <a href="crypto.html#hashdigestencoding"><code>hash.digest()</code></a>. While the
	 * <code>hash.digest()</code> method does allow an <code>encoding</code> argument to be passed in,
	 * causing the method to return a string rather than a <code>Buffer</code>, the UTF-16
	 * encoding (e.g. <code>ucs</code> or <code>utf16le</code>) is not supported.</p>
	 * <p><a id="ERR_CRYPTO_SCRYPT_INVALID_PARAMETER"></a></p>
	 * @deprecated
	 */
	ERR_CRYPTO_HASH_DIGEST_NO_UTF16 = 'ERR_CRYPTO_HASH_DIGEST_NO_UTF16',
	/**
	 * <p>An incompatible combination of options was passed to <a href="crypto.html#cryptoscryptpassword-salt-keylen-options-callback"><code>crypto.scrypt()</code></a> or
	 * <a href="crypto.html#cryptoscryptsyncpassword-salt-keylen-options"><code>crypto.scryptSync()</code></a>. New versions of Node.js use the error code
	 * <a href="#err_incompatible_option_pair"><code>ERR_INCOMPATIBLE_OPTION_PAIR</code></a> instead, which is consistent with other APIs.</p>
	 * <p><a id="ERR_FS_INVALID_SYMLINK_TYPE"></a></p>
	 * @deprecated
	 */
	ERR_CRYPTO_SCRYPT_INVALID_PARAMETER = 'ERR_CRYPTO_SCRYPT_INVALID_PARAMETER',
	/**
	 * <p>An invalid symlink type was passed to the <a href="fs.html#fssymlinktarget-path-type-callback"><code>fs.symlink()</code></a> or
	 * <a href="fs.html#fssymlinksynctarget-path-type"><code>fs.symlinkSync()</code></a> methods.</p>
	 * <p><a id="ERR_HTTP2_FRAME_ERROR"></a></p>
	 * @deprecated
	 */
	ERR_FS_INVALID_SYMLINK_TYPE = 'ERR_FS_INVALID_SYMLINK_TYPE',
	/**
	 * <p>Used when a failure occurs sending an individual frame on the HTTP/2
	 * session.</p>
	 * <p><a id="ERR_HTTP2_HEADERS_OBJECT"></a></p>
	 * @deprecated
	 */
	ERR_HTTP2_FRAME_ERROR = 'ERR_HTTP2_FRAME_ERROR',
	/**
	 * <p>Used when an HTTP/2 Headers Object is expected.</p>
	 * <p><a id="ERR_HTTP2_HEADER_REQUIRED"></a></p>
	 * @deprecated
	 */
	ERR_HTTP2_HEADERS_OBJECT = 'ERR_HTTP2_HEADERS_OBJECT',
	/**
	 * <p>Used when a required header is missing in an HTTP/2 message.</p>
	 * <p><a id="ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND"></a></p>
	 * @deprecated
	 */
	ERR_HTTP2_HEADER_REQUIRED = 'ERR_HTTP2_HEADER_REQUIRED',
	/**
	 * <p>HTTP/2 informational headers must only be sent <em>prior</em> to calling the
	 * <code>Http2Stream.prototype.respond()</code> method.</p>
	 * <p><a id="ERR_HTTP2_STREAM_CLOSED"></a></p>
	 * @deprecated
	 */
	ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND = 'ERR_HTTP2_INFO_HEADERS_AFTER_RESPOND',
	/**
	 * <p>Used when an action has been performed on an HTTP/2 Stream that has already
	 * been closed.</p>
	 * <p><a id="ERR_HTTP_INVALID_CHAR"></a></p>
	 * @deprecated
	 */
	ERR_HTTP2_STREAM_CLOSED = 'ERR_HTTP2_STREAM_CLOSED',
	/**
	 * <p>Used when an invalid character is found in an HTTP response status message
	 * (reason phrase).</p>
	 * <p><a id="ERR_IMPORT_ASSERTION_TYPE_FAILED"></a></p>
	 * @deprecated
	 */
	ERR_HTTP_INVALID_CHAR = 'ERR_HTTP_INVALID_CHAR',
	/**
	 * <p>An import assertion has failed, preventing the specified module to be imported.</p>
	 * <p><a id="ERR_IMPORT_ASSERTION_TYPE_MISSING"></a></p>
	 * @deprecated
	 */
	ERR_IMPORT_ASSERTION_TYPE_FAILED = 'ERR_IMPORT_ASSERTION_TYPE_FAILED',
	/**
	 * <p>An import assertion is missing, preventing the specified module to be imported.</p>
	 * <p><a id="ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED"></a></p>
	 * @deprecated
	 */
	ERR_IMPORT_ASSERTION_TYPE_MISSING = 'ERR_IMPORT_ASSERTION_TYPE_MISSING',
	/**
	 * <p>An import attribute is not supported by this version of Node.js.</p>
	 * <p><a id="ERR_INDEX_OUT_OF_RANGE"></a></p>
	 * @deprecated
	 */
	ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED = 'ERR_IMPORT_ASSERTION_TYPE_UNSUPPORTED',
	/**
	 * <p>A given index was out of the accepted range (e.g. negative offsets).</p>
	 * <p><a id="ERR_INVALID_OPT_VALUE"></a></p>
	 * @deprecated
	 */
	ERR_INDEX_OUT_OF_RANGE = 'ERR_INDEX_OUT_OF_RANGE',
	/**
	 * <p>An invalid or unexpected value was passed in an options object.</p>
	 * <p><a id="ERR_INVALID_OPT_VALUE_ENCODING"></a></p>
	 * @deprecated
	 */
	ERR_INVALID_OPT_VALUE = 'ERR_INVALID_OPT_VALUE',
	/**
	 * <p>An invalid or unknown file encoding was passed.</p>
	 * <p><a id="ERR_INVALID_PERFORMANCE_MARK"></a></p>
	 * @deprecated
	 */
	ERR_INVALID_OPT_VALUE_ENCODING = 'ERR_INVALID_OPT_VALUE_ENCODING',
	/**
	 * <p>While using the Performance Timing API (<code>perf_hooks</code>), a performance mark is
	 * invalid.</p>
	 * <p><a id="ERR_INVALID_TRANSFER_OBJECT"></a></p>
	 * @deprecated
	 */
	ERR_INVALID_PERFORMANCE_MARK = 'ERR_INVALID_PERFORMANCE_MARK',
	/**
	 * <p>An invalid transfer object was passed to <code>postMessage()</code>.</p>
	 * <p><a id="ERR_MANIFEST_ASSERT_INTEGRITY"></a></p>
	 * @deprecated
	 */
	ERR_INVALID_TRANSFER_OBJECT = 'ERR_INVALID_TRANSFER_OBJECT',
	/**
	 * <p>An attempt was made to load a resource, but the resource did not match the
	 * integrity defined by the policy manifest. See the documentation for policy
	 * manifests for more information.</p>
	 * <p><a id="ERR_MANIFEST_DEPENDENCY_MISSING"></a></p>
	 * @deprecated
	 */
	ERR_MANIFEST_ASSERT_INTEGRITY = 'ERR_MANIFEST_ASSERT_INTEGRITY',
	/**
	 * <p>An attempt was made to load a resource, but the resource was not listed as a
	 * dependency from the location that attempted to load it. See the documentation
	 * for policy manifests for more information.</p>
	 * <p><a id="ERR_MANIFEST_INTEGRITY_MISMATCH"></a></p>
	 * @deprecated
	 */
	ERR_MANIFEST_DEPENDENCY_MISSING = 'ERR_MANIFEST_DEPENDENCY_MISSING',
	/**
	 * <p>An attempt was made to load a policy manifest, but the manifest had multiple
	 * entries for a resource which did not match each other. Update the manifest
	 * entries to match in order to resolve this error. See the documentation for
	 * policy manifests for more information.</p>
	 * <p><a id="ERR_MANIFEST_INVALID_RESOURCE_FIELD"></a></p>
	 * @deprecated
	 */
	ERR_MANIFEST_INTEGRITY_MISMATCH = 'ERR_MANIFEST_INTEGRITY_MISMATCH',
	/**
	 * <p>A policy manifest resource had an invalid value for one of its fields. Update
	 * the manifest entry to match in order to resolve this error. See the
	 * documentation for policy manifests for more information.</p>
	 * <p><a id="ERR_MANIFEST_INVALID_SPECIFIER"></a></p>
	 * @deprecated
	 */
	ERR_MANIFEST_INVALID_RESOURCE_FIELD = 'ERR_MANIFEST_INVALID_RESOURCE_FIELD',
	/**
	 * <p>A policy manifest resource had an invalid value for one of its dependency
	 * mappings. Update the manifest entry to match to resolve this error. See the
	 * documentation for policy manifests for more information.</p>
	 * <p><a id="ERR_MANIFEST_PARSE_POLICY"></a></p>
	 * @deprecated
	 */
	ERR_MANIFEST_INVALID_SPECIFIER = 'ERR_MANIFEST_INVALID_SPECIFIER',
	/**
	 * <p>An attempt was made to load a policy manifest, but the manifest was unable to
	 * be parsed. See the documentation for policy manifests for more information.</p>
	 * <p><a id="ERR_MANIFEST_TDZ"></a></p>
	 * @deprecated
	 */
	ERR_MANIFEST_PARSE_POLICY = 'ERR_MANIFEST_PARSE_POLICY',
	/**
	 * <p>An attempt was made to read from a policy manifest, but the manifest
	 * initialization has not yet taken place. This is likely a bug in Node.js.</p>
	 * <p><a id="ERR_MANIFEST_UNKNOWN_ONERROR"></a></p>
	 * @deprecated
	 */
	ERR_MANIFEST_TDZ = 'ERR_MANIFEST_TDZ',
	/**
	 * <p>A policy manifest was loaded, but had an unknown value for its "onerror"
	 * behavior. See the documentation for policy manifests for more information.</p>
	 * <p><a id="ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST"></a></p>
	 * @deprecated
	 */
	ERR_MANIFEST_UNKNOWN_ONERROR = 'ERR_MANIFEST_UNKNOWN_ONERROR',
	/**
	 * <p>This error code was replaced by <a href="#err_missing_transferable_in_transfer_list"><code>ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST</code></a>
	 * in Node.js v15.0.0, because it is no longer accurate as other types of
	 * transferable objects also exist now.</p>
	 * <p><a id="ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST"></a></p>
	 * @deprecated
	 */
	ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST = 'ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST',
	/**
	 * <p>An object that needs to be explicitly listed in the <code>transferList</code> argument
	 * is in the object passed to a <a href="worker_threads.html#portpostmessagevalue-transferlist"><code>postMessage()</code></a> call, but is not provided
	 * in the <code>transferList</code> for that call. Usually, this is a <code>MessagePort</code>.</p>
	 * <p>In Node.js versions prior to v15.0.0, the error code being used here was
	 * <a href="#err_missing_message_port_in_transfer_list"><code>ERR_MISSING_MESSAGE_PORT_IN_TRANSFER_LIST</code></a>. However, the set of
	 * transferable object types has been expanded to cover more types than
	 * <code>MessagePort</code>.</p>
	 * <p><a id="ERR_NAPI_CONS_PROTOTYPE_OBJECT"></a></p>
	 * @deprecated
	 */
	ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST = 'ERR_MISSING_TRANSFERABLE_IN_TRANSFER_LIST',
	/**
	 * <p>Used by the <code>Node-API</code> when <code>Constructor.prototype</code> is not an object.</p>
	 * <p><a id="ERR_NAPI_TSFN_START_IDLE_LOOP"></a></p>
	 * @deprecated
	 */
	ERR_NAPI_CONS_PROTOTYPE_OBJECT = 'ERR_NAPI_CONS_PROTOTYPE_OBJECT',
	/**
	 * <p>On the main thread, values are removed from the queue associated with the
	 * thread-safe function in an idle loop. This error indicates that an error
	 * has occurred when attempting to start the loop.</p>
	 * <p><a id="ERR_NAPI_TSFN_STOP_IDLE_LOOP"></a></p>
	 * @deprecated
	 */
	ERR_NAPI_TSFN_START_IDLE_LOOP = 'ERR_NAPI_TSFN_START_IDLE_LOOP',
	/**
	 * <p>Once no more items are left in the queue, the idle loop must be suspended. This
	 * error indicates that the idle loop has failed to stop.</p>
	 * <p><a id="ERR_NO_LONGER_SUPPORTED"></a></p>
	 * @deprecated
	 */
	ERR_NAPI_TSFN_STOP_IDLE_LOOP = 'ERR_NAPI_TSFN_STOP_IDLE_LOOP',
	/**
	 * <p>A Node.js API was called in an unsupported manner, such as
	 * <code>Buffer.write(string, encoding, offset[, length])</code>.</p>
	 * <p><a id="ERR_OUTOFMEMORY"></a></p>
	 * @deprecated
	 */
	ERR_NO_LONGER_SUPPORTED = 'ERR_NO_LONGER_SUPPORTED',
	/**
	 * <p>Used generically to identify that an operation caused an out of memory
	 * condition.</p>
	 * <p><a id="ERR_PARSE_HISTORY_DATA"></a></p>
	 * @deprecated
	 */
	ERR_OUTOFMEMORY = 'ERR_OUTOFMEMORY',
	/**
	 * <p>The <code>node:repl</code> module was unable to parse data from the REPL history file.</p>
	 * <p><a id="ERR_SOCKET_CANNOT_SEND"></a></p>
	 * @deprecated
	 */
	ERR_PARSE_HISTORY_DATA = 'ERR_PARSE_HISTORY_DATA',
	/**
	 * <p>Data could not be sent on a socket.</p>
	 * <p><a id="ERR_STDERR_CLOSE"></a></p>
	 * @deprecated
	 */
	ERR_SOCKET_CANNOT_SEND = 'ERR_SOCKET_CANNOT_SEND',
	/**
	 * <p>An attempt was made to close the <code>process.stderr</code> stream. By design, Node.js
	 * does not allow <code>stdout</code> or <code>stderr</code> streams to be closed by user code.</p>
	 * <p><a id="ERR_STDOUT_CLOSE"></a></p>
	 * @deprecated
	 */
	ERR_STDERR_CLOSE = 'ERR_STDERR_CLOSE',
	/**
	 * <p>An attempt was made to close the <code>process.stdout</code> stream. By design, Node.js
	 * does not allow <code>stdout</code> or <code>stderr</code> streams to be closed by user code.</p>
	 * <p><a id="ERR_STREAM_READ_NOT_IMPLEMENTED"></a></p>
	 * @deprecated
	 */
	ERR_STDOUT_CLOSE = 'ERR_STDOUT_CLOSE',
	/**
	 * <p>Used when an attempt is made to use a readable stream that has not implemented
	 * <a href="stream.html#readable_readsize"><code>readable._read()</code></a>.</p>
	 * <p><a id="ERR_TAP_LEXER_ERROR"></a></p>
	 * @deprecated
	 */
	ERR_STREAM_READ_NOT_IMPLEMENTED = 'ERR_STREAM_READ_NOT_IMPLEMENTED',
	/**
	 * <p>An error representing a failing lexer state.</p>
	 * <p><a id="ERR_TAP_PARSER_ERROR"></a></p>
	 * @deprecated
	 */
	ERR_TAP_LEXER_ERROR = 'ERR_TAP_LEXER_ERROR',
	/**
	 * <p>An error representing a failing parser state. Additional information about
	 * the token causing the error is available via the <code>cause</code> property.</p>
	 * <p><a id="ERR_TAP_VALIDATION_ERROR"></a></p>
	 * @deprecated
	 */
	ERR_TAP_PARSER_ERROR = 'ERR_TAP_PARSER_ERROR',
	/**
	 * <p>This error represents a failed TAP validation.</p>
	 * <p><a id="ERR_TLS_RENEGOTIATION_FAILED"></a></p>
	 * @deprecated
	 */
	ERR_TAP_VALIDATION_ERROR = 'ERR_TAP_VALIDATION_ERROR',
	/**
	 * <p>Used when a TLS renegotiation request has failed in a non-specific way.</p>
	 * <p><a id="ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER"></a></p>
	 * @deprecated
	 */
	ERR_TLS_RENEGOTIATION_FAILED = 'ERR_TLS_RENEGOTIATION_FAILED',
	/**
	 * <p>A <code>SharedArrayBuffer</code> whose memory is not managed by the JavaScript engine
	 * or by Node.js was encountered during serialization. Such a <code>SharedArrayBuffer</code>
	 * cannot be serialized.</p>
	 * <p>This can only happen when native addons create <code>SharedArrayBuffer</code>s in
	 * "externalized" mode, or put existing <code>SharedArrayBuffer</code> into externalized mode.</p>
	 * <p><a id="ERR_UNKNOWN_STDIN_TYPE"></a></p>
	 * @deprecated
	 */
	ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER = 'ERR_TRANSFERRING_EXTERNALIZED_SHAREDARRAYBUFFER',
	/**
	 * <p>An attempt was made to launch a Node.js process with an unknown <code>stdin</code> file
	 * type. This error is usually an indication of a bug within Node.js itself,
	 * although it is possible for user code to trigger it.</p>
	 * <p><a id="ERR_UNKNOWN_STREAM_TYPE"></a></p>
	 * @deprecated
	 */
	ERR_UNKNOWN_STDIN_TYPE = 'ERR_UNKNOWN_STDIN_TYPE',
	/**
	 * <p>An attempt was made to launch a Node.js process with an unknown <code>stdout</code> or
	 * <code>stderr</code> file type. This error is usually an indication of a bug within Node.js
	 * itself, although it is possible for user code to trigger it.</p>
	 * <p><a id="ERR_V8BREAKITERATOR"></a></p>
	 * @deprecated
	 */
	ERR_UNKNOWN_STREAM_TYPE = 'ERR_UNKNOWN_STREAM_TYPE',
	/**
	 * <p>The V8 <code>BreakIterator</code> API was used but the full ICU data set is not installed.</p>
	 * <p><a id="ERR_VALUE_OUT_OF_RANGE"></a></p>
	 * @deprecated
	 */
	ERR_V8BREAKITERATOR = 'ERR_V8BREAKITERATOR',
	/**
	 * <p>Used when a given value is out of the accepted range.</p>
	 * <p><a id="ERR_VM_MODULE_LINKING_ERRORED"></a></p>
	 * @deprecated
	 */
	ERR_VALUE_OUT_OF_RANGE = 'ERR_VALUE_OUT_OF_RANGE',
	/**
	 * <p>The linker function returned a module for which linking has failed.</p>
	 * <p><a id="ERR_VM_MODULE_NOT_LINKED"></a></p>
	 * @deprecated
	 */
	ERR_VM_MODULE_LINKING_ERRORED = 'ERR_VM_MODULE_LINKING_ERRORED',
	/**
	 * <p>The module must be successfully linked before instantiation.</p>
	 * <p><a id="ERR_WORKER_UNSUPPORTED_EXTENSION"></a></p>
	 * @deprecated
	 */
	ERR_VM_MODULE_NOT_LINKED = 'ERR_VM_MODULE_NOT_LINKED',
	/**
	 * <p>The pathname used for the main script of a worker has an
	 * unknown file extension.</p>
	 * <p><a id="ERR_ZLIB_BINDING_CLOSED"></a></p>
	 * @deprecated
	 */
	ERR_WORKER_UNSUPPORTED_EXTENSION = 'ERR_WORKER_UNSUPPORTED_EXTENSION',
	/**
	 * <p>Used when an attempt is made to use a <code>zlib</code> object after it has already been
	 * closed.</p>
	 * <p><a id="openssl-error-codes"></a></p>
	 * @deprecated
	 */
	ERR_ZLIB_BINDING_CLOSED = 'ERR_ZLIB_BINDING_CLOSED',
}

export enum OpenSSLErrorCode {
	/**
	 * <p>The certificate is not yet valid: the notBefore date is after the current time.</p>
	 * <p><a id="CERT_HAS_EXPIRED"></a></p>
	 */
	CERT_NOT_YET_VALID = 'CERT_NOT_YET_VALID',
	/**
	 * <p>The certificate has expired: the notAfter date is before the current time.</p>
	 * <p><a id="CRL_NOT_YET_VALID"></a></p>
	 */
	CERT_HAS_EXPIRED = 'CERT_HAS_EXPIRED',
	/**
	 * <p>The certificate revocation list (CRL) has a future issue date.</p>
	 * <p><a id="CRL_HAS_EXPIRED"></a></p>
	 */
	CRL_NOT_YET_VALID = 'CRL_NOT_YET_VALID',
	/**
	 * <p>The certificate revocation list (CRL) has expired.</p>
	 * <p><a id="CERT_REVOKED"></a></p>
	 */
	CRL_HAS_EXPIRED = 'CRL_HAS_EXPIRED',
	/**
	 * <p>The certificate has been revoked; it is on a certificate revocation list (CRL).</p>
	 * <p><a id="Trust or Chain Related Errors"></a></p>
	 */
	CERT_REVOKED = 'CERT_REVOKED',
	/**
	 * <p>The issuer certificate of a looked up certificate could not be found. This
	 * normally means the list of trusted certificates is not complete.</p>
	 * <p><a id="UNABLE_TO_GET_ISSUER_CERT_LOCALLY"></a></p>
	 */
	UNABLE_TO_GET_ISSUER_CERT = 'UNABLE_TO_GET_ISSUER_CERT',
	/**
	 * <p>The certificate’s issuer is not known. This is the case if the issuer is not
	 * included in the trusted certificate list.</p>
	 * <p><a id="DEPTH_ZERO_SELF_SIGNED_CERT"></a></p>
	 */
	UNABLE_TO_GET_ISSUER_CERT_LOCALLY = 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
	/**
	 * <p>The passed certificate is self-signed and the same certificate cannot be found
	 * in the list of trusted certificates.</p>
	 * <p><a id="SELF_SIGNED_CERT_IN_CHAIN"></a></p>
	 */
	DEPTH_ZERO_SELF_SIGNED_CERT = 'DEPTH_ZERO_SELF_SIGNED_CERT',
	/**
	 * <p>The certificate’s issuer is not known. This is the case if the issuer is not
	 * included in the trusted certificate list.</p>
	 * <p><a id="CERT_CHAIN_TOO_LONG"></a></p>
	 */
	SELF_SIGNED_CERT_IN_CHAIN = 'SELF_SIGNED_CERT_IN_CHAIN',
	/**
	 * <p>The certificate chain length is greater than the maximum depth.</p>
	 * <p><a id="UNABLE_TO_GET_CRL"></a></p>
	 */
	CERT_CHAIN_TOO_LONG = 'CERT_CHAIN_TOO_LONG',
	/**
	 * <p>The CRL reference by the certificate could not be found.</p>
	 * <p><a id="UNABLE_TO_VERIFY_LEAF_SIGNATURE"></a></p>
	 */
	UNABLE_TO_GET_CRL = 'UNABLE_TO_GET_CRL',
	/**
	 * <p>No signatures could be verified because the chain contains only one certificate
	 * and it is not self signed.</p>
	 * <p><a id="CERT_UNTRUSTED"></a></p>
	 */
	UNABLE_TO_VERIFY_LEAF_SIGNATURE = 'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
	/**
	 * <p>The root certificate authority (CA) is not marked as trusted for the specified
	 * purpose.</p>
	 * <p><a id="Basic Extension Errors"></a></p>
	 */
	CERT_UNTRUSTED = 'CERT_UNTRUSTED',
	/**
	 * <p>A CA certificate is invalid. Either it is not a CA or its extensions are not
	 * consistent with the supplied purpose.</p>
	 * <p><a id="PATH_LENGTH_EXCEEDED"></a></p>
	 */
	INVALID_CA = 'INVALID_CA',
	/**
	 * <p>The basicConstraints pathlength parameter has been exceeded.</p>
	 * <p><a id="Name Related Errors"></a></p>
	 */
	PATH_LENGTH_EXCEEDED = 'PATH_LENGTH_EXCEEDED',
	/**
	 * <p>Certificate does not match provided name.</p>
	 * <p><a id="Usage and Policy Errors"></a></p>
	 */
	HOSTNAME_MISMATCH = 'HOSTNAME_MISMATCH',
	/**
	 * <p>The supplied certificate cannot be used for the specified purpose.</p>
	 * <p><a id="CERT_REJECTED"></a></p>
	 */
	INVALID_PURPOSE = 'INVALID_PURPOSE',
	/**
	 * <p>The root CA is marked to reject the specified purpose.</p>
	 * <p><a id="Formatting Errors"></a></p>
	 */
	CERT_REJECTED = 'CERT_REJECTED',
	/**
	 * <p>The signature of the certificate is invalid.</p>
	 * <p><a id="CRL_SIGNATURE_FAILURE"></a></p>
	 */
	CERT_SIGNATURE_FAILURE = 'CERT_SIGNATURE_FAILURE',
	/**
	 * <p>The signature of the certificate revocation list (CRL) is invalid.</p>
	 * <p><a id="ERROR_IN_CERT_NOT_BEFORE_FIELD"></a></p>
	 */
	CRL_SIGNATURE_FAILURE = 'CRL_SIGNATURE_FAILURE',
	/**
	 * <p>The certificate notBefore field contains an invalid time.</p>
	 * <p><a id="ERROR_IN_CERT_NOT_AFTER_FIELD"></a></p>
	 */
	ERROR_IN_CERT_NOT_BEFORE_FIELD = 'ERROR_IN_CERT_NOT_BEFORE_FIELD',
	/**
	 * <p>The certificate notAfter field contains an invalid time.</p>
	 * <p><a id="ERROR_IN_CRL_LAST_UPDATE_FIELD"></a></p>
	 */
	ERROR_IN_CERT_NOT_AFTER_FIELD = 'ERROR_IN_CERT_NOT_AFTER_FIELD',
	/**
	 * <p>The CRL lastUpdate field contains an invalid time.</p>
	 * <p><a id="ERROR_IN_CRL_NEXT_UPDATE_FIELD"></a></p>
	 */
	ERROR_IN_CRL_LAST_UPDATE_FIELD = 'ERROR_IN_CRL_LAST_UPDATE_FIELD',
	/**
	 * <p>The CRL nextUpdate field contains an invalid time.</p>
	 * <p><a id="UNABLE_TO_DECRYPT_CERT_SIGNATURE"></a></p>
	 */
	ERROR_IN_CRL_NEXT_UPDATE_FIELD = 'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
	/**
	 * <p>The certificate signature could not be decrypted. This means that the actual
	 * signature value could not be determined rather than it not matching the expected
	 * value, this is only meaningful for RSA keys.</p>
	 * <p><a id="UNABLE_TO_DECRYPT_CRL_SIGNATURE"></a></p>
	 */
	UNABLE_TO_DECRYPT_CERT_SIGNATURE = 'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
	/**
	 * <p>The certificate revocation list (CRL) signature could not be decrypted: this
	 * means that the actual signature value could not be determined rather than it not
	 * matching the expected value.</p>
	 * <p><a id="UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY"></a></p>
	 */
	UNABLE_TO_DECRYPT_CRL_SIGNATURE = 'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
	/**
	 * <p>The public key in the certificate SubjectPublicKeyInfo could not be read.</p>
	 * <p><a id="Other OpenSSL Errors"></a></p>
	 */
	UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY = 'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
	/**
	 * <p>An error occurred trying to allocate memory. This should never happen.</p>
	 */
	OUT_OF_MEM = 'OUT_OF_MEM',
}

