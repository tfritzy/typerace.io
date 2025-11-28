using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;
using SpacetimeDB;
using SpacetimeDB.BSATN;
using SpacetimeDB.Internal;

[Type]
public partial struct HttpRequest
{
    public HttpMethod Method;
    public List<HttpHeader> Headers;
    public long? TimeoutMicroseconds;
    public string Uri;
    public HttpVersion Version;
}

[Type]
public enum HttpMethod
{
    Get,
    Head,
    Post,
    Put,
    Delete,
    Connect,
    Options,
    Trace,
    Patch
}

[Type]
public enum HttpVersion
{
    Http09,
    Http10,
    Http11,
    Http2,
    Http3
}

[Type]
public partial struct HttpHeader
{
    public string Name;
    public byte[] Value;
}

[Type]
public partial struct HttpResponse
{
    public List<HttpHeader> Headers;
    public HttpVersion Version;
    public ushort Code;
}

public static class SpacetimeHttp
{
    private const string UserAgent = "WikiQuote-SpacetimeDB/1.0";
    private const long DefaultTimeoutMicroseconds = 30_000_000;

    private const string StdbNamespace10_3 =
#if EXPERIMENTAL_WASM_AOT
        "spacetime_10.3"
#else
        "bindings"
#endif
    ;

    [DllImport(StdbNamespace10_3)]
    private static extern ushort procedure_http_request(
        byte[] request_ptr,
        uint request_len,
        byte[] body_ptr,
        uint body_len,
        [Out] uint[] out_ptr
    );

    public static HttpResponse? HttpGet(string uri)
    {
        return DoRequest(HttpMethod.Get, uri, null);
    }

    public static HttpResponse? HttpPost(string uri, byte[]? body)
    {
        return DoRequest(HttpMethod.Post, uri, body);
    }

    private static HttpResponse? DoRequest(HttpMethod method, string uri, byte[]? body)
    {
        var (response, _) = DoRequestWithBody(method, uri, body);
        return response;
    }

    public static byte[] ReadBody(uint bodySourceHandle)
    {
        if (bodySourceHandle == 0)
        {
            return Array.Empty<byte>();
        }
        return ReadBytesSource(new BytesSource(bodySourceHandle));
    }

    public static (HttpResponse? Response, byte[] Body) HttpGetWithBody(string uri)
    {
        return DoRequestWithBody(HttpMethod.Get, uri, null);
    }

    private static (HttpResponse? Response, byte[] Body) DoRequestWithBody(HttpMethod method, string uri, byte[]? body)
    {
        var request = new HttpRequest
        {
            Method = method,
            Headers = new List<HttpHeader>
            {
                new HttpHeader { Name = "User-Agent", Value = Encoding.UTF8.GetBytes(UserAgent) }
            },
            TimeoutMicroseconds = DefaultTimeoutMicroseconds,
            Uri = uri,
            Version = HttpVersion.Http11
        };

        var requestBytes = IStructuralReadWrite.ToBytes(new HttpRequest.BSATN(), request);
        var bodyBytes = body ?? Array.Empty<byte>();
        var outPtr = new uint[2];

        var result = procedure_http_request(
            requestBytes,
            (uint)requestBytes.Length,
            bodyBytes,
            (uint)bodyBytes.Length,
            outPtr
        );

        if (result != 0)
        {
            Log.Error($"HTTP request failed with error code: {result}");
            return (null, Array.Empty<byte>());
        }

        var responseSourceHandle = outPtr[0];
        var bodySourceHandle = outPtr[1];

        if (responseSourceHandle == 0)
        {
            return (null, Array.Empty<byte>());
        }

        var response = ParseResponse(responseSourceHandle);
        var responseBody = bodySourceHandle != 0 ? ReadBytesSource(new BytesSource(bodySourceHandle)) : Array.Empty<byte>();

        return (response, responseBody);
    }

    private static HttpResponse ParseResponse(uint responseSourceHandle)
    {
        var responseBytes = ReadBytesSource(new BytesSource(responseSourceHandle));
        using var stream = new MemoryStream(responseBytes);
        using var reader = new BinaryReader(stream);
        return new HttpResponse.BSATN().Read(reader);
    }

    private static byte[] ReadBytesSource(BytesSource source)
    {
        return source.Consume();
    }
}
