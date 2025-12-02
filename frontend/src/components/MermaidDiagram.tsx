import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidDiagramProps {
  chart: string;
  id?: string;
}

// Initialize Mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  themeVariables: {
    primaryColor: "#6366f1",
    primaryTextColor: "#fff",
    primaryBorderColor: "#4f46e5",
    lineColor: "#8b5cf6",
    secondaryColor: "#8b5cf6",
    tertiaryColor: "#ec4899",
    background: "#1f2937",
    mainBkg: "#374151",
    secondBkg: "#4b5563",
    textColor: "#f3f4f6",
    border1: "#6b7280",
    border2: "#9ca3af",
    fontSize: "14px",
  },
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: "basis",
    diagramPadding: 8,
    nodeSpacing: 50,
    rankSpacing: 50,
  },
});

export function MermaidDiagram({ chart, id }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    const renderDiagram = async () => {
      if (containerRef.current && chart) {
        try {
          const uniqueId = id || `mermaid-diagram-${Math.random().toString(36).substr(2, 9)}`;
          const { svg } = await mermaid.render(uniqueId, chart);
          setSvg(svg);
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          containerRef.current.innerHTML = `<pre class="text-red-400">Error rendering diagram: ${error}</pre>`;
        }
      }
    };

    renderDiagram();
  }, [chart, id]);

  return (
    <div
      ref={containerRef}
      className="bg-gray-900 p-6 rounded-xl overflow-x-auto flex justify-center items-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
