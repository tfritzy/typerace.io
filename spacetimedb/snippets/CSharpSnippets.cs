namespace StdbModule;

public static class CSharpSnippets
{
    public static readonly Snippet[] Snippets = new Snippet[]
    {
        new Snippet { Text = "var vertices = new NativeArray<float3>(mesh.vertexCount, Allocator.TempJob);\nvar normals = new NativeArray<float3>(mesh.vertexCount, Allocator.TempJob);\nvar triangles = new NativeArray<int>(mesh.triangles.Length, Allocator.TempJob);\nMeshToNativeArrays(mesh, vertices, normals, triangles);", Source = "SebLague/Geographical-Adventures" },
        new Snippet { Text = "if (path != null)\n{\n    for (int i = 0; i < path.Count; i++)\n    {\n        Gizmos.color = Color.black;\n        Gizmos.DrawSphere(path[i], 0.1f);\n        if (i > 0)\n        {\n            Gizmos.DrawLine(path[i - 1], path[i]);\n        }\n    }\n}", Source = "SebLague/Geographical-Adventures" },
        new Snippet { Text = "for (int i = 0; i < triangleCount; i++)\n{\n    int triIndexA = i * 3;\n    int indexA = triangles[triIndexA];\n    int indexB = triangles[triIndexA + 1];\n    int indexC = triangles[triIndexA + 2];\n    float3 a = vertices[indexA];\n    float3 b = vertices[indexB];\n    float3 c = vertices[indexC];\n}", Source = "SebLague/Geographical-Adventures" },
        new Snippet { Text = "Vector3 targetPos = transform.position + transform.forward * moveAmount;\ntargetPos.y = Terrain.activeTerrain.SampleHeight(targetPos);\ntargetPos.y += heightAboveTerrain;\ntransform.position = Vector3.Lerp(transform.position, targetPos, Time.deltaTime * smoothing);", Source = "SebLague/Geographical-Adventures" },
        new Snippet { Text = "for (int i = 0; i < points.Length; i++)\n{\n    float t = i / (points.Length - 1f);\n    float angle = Mathf.Lerp(startAngle, endAngle, t);\n    float x = Mathf.Cos(angle) * radius;\n    float y = Mathf.Sin(angle) * radius;\n    points[i] = new Vector2(x, y);\n}", Source = "SebLague/Geographical-Adventures" },
        new Snippet { Text = "if (!string.IsNullOrEmpty(identity))\n{\n    var claim = new Claim(ClaimTypes.NameIdentifier, identity);\n    var claimsIdentity = new ClaimsIdentity(new[] { claim }, \"SpacetimeDB\");\n    context.User = new ClaimsPrincipal(claimsIdentity);\n}", Source = "clockworklabs/SpacetimeDB" },
        new Snippet { Text = "foreach (var row in rows)\n{\n    var key = keySelector(row);\n    if (!groups.TryGetValue(key, out var group))\n    {\n        group = new List<T>();\n        groups[key] = group;\n    }\n    group.Add(row);\n}", Source = "clockworklabs/SpacetimeDB" },
        new Snippet { Text = "using var reader = command.ExecuteReader();\nwhile (reader.Read())\n{\n    var id = reader.GetInt64(0);\n    var name = reader.GetString(1);\n    var value = reader.IsDBNull(2) ? null : reader.GetString(2);\n    yield return new Entry(id, name, value);\n}", Source = "clockworklabs/SpacetimeDB" },
        new Snippet { Text = "if (args.Length > 0 && args[0] == \"--version\")\n{\n    Console.WriteLine(Assembly.GetExecutingAssembly()\n        .GetCustomAttribute<AssemblyInformationalVersionAttribute>()\n        ?.InformationalVersion ?? \"unknown\");\n    return 0;\n}", Source = "clockworklabs/SpacetimeDB" },
        new Snippet { Text = "var options = new JsonSerializerOptions\n{\n    PropertyNamingPolicy = JsonNamingPolicy.CamelCase,\n    WriteIndented = true,\n    DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull\n};\nreturn JsonSerializer.Serialize(value, options);", Source = "clockworklabs/SpacetimeDB" },
    };
}
