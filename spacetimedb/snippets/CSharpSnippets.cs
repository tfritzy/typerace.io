namespace StdbModule;

public static class CSharpSnippets
{
    public static readonly string[] Snippets = new string[]
    {
        "var current = type;\nwhile (current != null)\n{\n    yield return current;\n    current = current.BaseType;\n}",
        "if (string.IsNullOrEmpty(token) || game.Players.FirstOrDefault()?.Token != token)\n{\n    throw new BadRequest(\"Only the game owner can start the game.\");\n}\n\nInitDeck(game);\nDealCards(game);\ngame.State = GameState.Playing;\ngame.TurnPhase = TurnPhase.Drawing;\n\ngame.AddEvent(new StartGameEvent());",
        "foreach (Player player in game.Players)\n{\n    player.Hand = new();\n}\n\nfor (int i = 0; i < HandSizeForRound(game.Round); i++)\n{\n    foreach (Player player in game.Players)\n    {\n        player.Hand.Add(game.Deck.Last());\n        game.Deck.RemoveAt(game.Deck.Count - 1);\n    }\n}\n\ngame.Pile.Add(game.Deck.Last());\ngame.Deck.RemoveAt(game.Deck.Count - 1);",
        "return ActiveItems?.AddItem(item) == true || Inventory?.AddItem(item) == true;",
        "return items.FirstOrDefault(item => \n    item != null && (itemType == null || item.Type == itemType));",
        "var schema = new Schema.OneofComponent\n{\n    Life = new Schema.Life()\n    {\n        MaxHealth = BaseHealth,\n        Health = Health,\n    }\n};\nreturn schema;",
        "if (options.Count == 0)\n    return null;\n\nCharacter minChar = options[0];\nfloat minDistance = (minChar.Location - Owner.Location).SquareMagnitude();\n\nforeach (var option in options)\n{\n    float distance = (option.Location - Owner.Location).SquareMagnitude();\n    if (distance < minDistance)\n    {\n        minChar = option;\n        minDistance = distance;\n    }\n}\n\nreturn minChar;",
        "mesh = Seb.Meshing.IcoSphere.Generate(meshRes, 0.5f).ToMesh();\n\nbuffer = GetComponent<CityLightGenerator>().allLights;\nargs = ComputeHelper.CreateArgsBuffer(mesh, buffer.count);\ncityLightMat = new Material(shader);",
        "gameCamera = FindObjectOfType<GameCamera>();\n\nworldRadius = heightSettings.worldRadius;\n\nSetStartPos(startPoint);\n\nbaseTargetSpeed = Mathf.Lerp(minSpeed, maxSpeed, 0.35f);\ncurrentSpeed = baseTargetSpeed;\nSetNavigationLightScale(0);\n\npositionHistory = new Queue<Vector3>(maxHistorySize);\nboostTimeRemaining = boostTimeAtStart;",
        "Vector3 newPos = transform.position + transform.forward * forwardSpeed * Time.deltaTime;\nif (worldIsSpherical)\n{\n  newPos = newPos.normalized * (worldRadius + currentElevation);\n}\nelse\n{\n  newPos = new Vector3(newPos.x, currentElevation, newPos.z);\n}\ntransform.position = newPos;",
        "// Decrease boost timer when boosting\nif (boosting)\n{\n  boostTimeRemaining = Mathf.Max(0, boostTimeRemaining - Time.deltaTime);\n}\n// Increase boost timer gradually when time has been gained\nif (boostTimeToAdd > 0)\n{\n  const float boostAddSpeed = 4;\n  float boostTimeToAddThisFrame = Mathf.Min(Time.deltaTime * boostAddSpeed, boostTimeToAdd);\n  boostTimeRemaining += boostTimeToAddThisFrame;\n  boostTimeToAdd -= boostTimeToAddThisFrame;\n  boostTimeRemaining = Mathf.Min(boostTimeRemaining, maxBoostTime);\n}",
        "for (int i = 0; i < navigationLights.Length; i++)\n{\n  if (smooth)\n  {\n    float currentScale = navigationLights[i].localScale.x;\n    navigationLights[i].localScale = Vector3.one * Mathf.Lerp(currentScale, scale, Time.deltaTime);\n  }\n  else\n  {\n    navigationLights[i].localScale = Vector3.one * scale;\n  }\n}",
        "Package package = Instantiate(packagePrefab, packageDropPoint.position, packageDropPoint.rotation);\npackage.Init(worldLookup);\npackageDropped?.Invoke(package);\nreturn package;",
        "parachute.transform.position += velocity * Time.deltaTime / 2;\n\nif (parachute.transform.position.magnitude < parachuteAttachPoint.position.magnitude)\n{\n  parachute.transform.position = Vector3.ClampMagnitude(parachute.transform.position, parachuteAttachPoint.position.magnitude);\n  parachuteHasLanded = true;\n}",
        "positionBuffer.SetData(spawnData.points);\npredictedPositionsBuffer.SetData(spawnData.points);\nvelocityBuffer.SetData(spawnData.velocities);\n\nfoamBuffer.SetData(new FoamParticle[foamBuffer.count]);\n\ndebugBuffer.SetData(new float3[debugBuffer.count]);\nfoamCountBuffer.SetData(new uint[foamCountBuffer.count]);\nsimTimer = 0;",
        "foreach (var otherBody in allBodies) {\n    if (otherBody != this) {\n        float sqrDst = (otherBody.rb.position - rb.position).sqrMagnitude;\n        Vector3 forceDir = (otherBody.rb.position - rb.position).normalized;\n\n        Vector3 acceleration = forceDir * Universe.gravitationalConstant * otherBody.mass / sqrDst;\n        velocity += acceleration * timeStep;\n    }\n}",
    };
}
