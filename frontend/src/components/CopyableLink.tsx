import { useCallback, useState } from "react";

type CopyableLinkProps = {
  url: string;
};

export const CopyableLink = ({ url }: CopyableLinkProps) => {
  const [linkCopied, setLinkCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  }, [url]);

  return (
    <div className="mt-4">
      <div 
        className="box rounded-lg px-6 py-4 cursor-pointer hover:bg-opacity-80 transition-all"
        onClick={handleCopyLink}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-white/60 text-sm mb-1">Share this link with friends:</div>
            <div className="text-white font-mono text-sm break-all">
              {url}
            </div>
          </div>
          <div className="ml-4 text-2xl">
            {linkCopied ? "✓" : "📋"}
          </div>
        </div>
        {linkCopied && (
          <div className="text-green-400 text-sm mt-2">Link copied to clipboard!</div>
        )}
      </div>
    </div>
  );
};
