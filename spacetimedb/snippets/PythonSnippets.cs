namespace StdbModule;

public static class PythonSnippets
{
    public static readonly Quote[] Quotes = new Quote[]
    {
        new Quote { Text = "if get_member_by_login_name:\n    registry = getUtility(IRegistry)\n    settings = registry.forInterface(ISecuritySchema, prefix=\"plone\")\n    if settings.use_email_as_login:\n        return get_member_by_login_name(self, userid, raise_exceptions=False)\nmembertool = getToolByName(self, \"portal_membership\")\nreturn membertool.getMemberById(userid)", Author = "plone/Products.CMFPlone" },
        new Quote { Text = "now = datetime.datetime.utcnow()\nfor key, record in list(self._requests.items()):\n    stored_user, expiry = record\n    if self.expired(expiry, now - datetime.timedelta(days=days)):\n        del self._requests[key]\n        self._p_changed = 1", Author = "plone/Products.CMFPlone" },
        new Quote { Text = "groups = self.getGroups(\"site\")\nall = []\nfor group in groups:\n    all.extend(self.enumConfiglets(group=group[\"id\"]))\nall = [item for item in all if item[\"visible\"]]\nreturn len(all) != 0", Author = "plone/Products.CMFPlone" },
        new Quote { Text = "acts = list(self.listActions())\nselection = [acts.index(a) for a in acts if a.appId == appId]\nif not selection:\n    return\nself.deleteActions(selection)", Author = "plone/Products.CMFPlone" },
        new Quote { Text = "REQUEST = arg2 or arg1\ntry:\n    notify(BeforeTraverseEvent(self, REQUEST))\nexcept ComponentLookupError:\n    pass\nself.setupCurrentSkin(REQUEST)\n\nsuper().__before_publishing_traverse__(arg1, arg2)", Author = "plone/Products.CMFPlone" },
        new Quote { Text = "if ids is None:\n    ids = []\nif isinstance(ids, str):\n    ids = [ids]\nfor id in ids:\n    item = self._getOb(id)\n    if not _checkPermission(permissions.DeleteObjects, item):\n        raise Unauthorized(\"Do not have permissions to remove this object\")\nreturn PortalObjectBase.manage_delObjects(self, ids, REQUEST=REQUEST)", Author = "plone/Products.CMFPlone" },
        new Quote { Text = "if EMAIL_RE.search(email) is None:\n    return 0\ntry:\n    checkEmailAddress(email)\nexcept EmailAddressInvalid:\n    return 0\nelse:\n    return 1", Author = "plone/Products.CMFPlone" },
        new Quote { Text = "for pattern, expected, message in _TESTS:\n    matched = pattern.search(address) is not None\n    if matched != expected:\n        return False, message\nreturn True, \"\"", Author = "plone/Products.CMFPlone" },
        new Quote { Text = "dist = [1e7] * self.V\ndist[src] = 0\nsptSet = [False] * self.V\nfor cout in range(self.V):\n    u = self.minDistance(dist, sptSet)\n    sptSet[u] = True\n    for v in range(self.V):\n        if (self.graph[u][v] > 0 and\n            sptSet[v] == False and\n            dist[v] > dist[u] + self.graph[u][v]):\n            dist[v] = dist[u] + self.graph[u][v]", Author = "TheAlgorithms/Python" },
        new Quote { Text = "visited = [False] * (max(self.graph) + 1)\nqueue = []\nqueue.append(s)\nvisited[s] = True\n\nwhile queue:\n    s = queue.pop(0)\n    print(s, end=\" \")\n    for i in self.graph[s]:\n        if not visited[i]:\n            queue.append(i)\n            visited[i] = True", Author = "TheAlgorithms/Python" },
        new Quote { Text = "pivot = array[high]\ni = low - 1\nfor j in range(low, high):\n    if array[j] <= pivot:\n        i = i + 1\n        (array[i], array[j]) = (array[j], array[i])\n\n(array[i + 1], array[high]) = (array[high], array[i + 1])\nreturn i + 1", Author = "TheAlgorithms/Python" },
        new Quote { Text = "n = len(arr)\nfor i in range(n // 2, -1, -1):\n    heapify(arr, n, i)\nfor i in range(n - 1, 0, -1):\n    (arr[i], arr[0]) = (arr[0], arr[i])\n    heapify(arr, i, 0)", Author = "TheAlgorithms/Python" },
    };
}
