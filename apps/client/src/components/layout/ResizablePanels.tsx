import { ReactNode } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

interface ResizablePanelsProps {
  left: ReactNode;
  center: ReactNode;
  right: ReactNode;
}

export function ResizablePanels({ left, center, right }: ResizablePanelsProps) {
  return (
    <PanelGroup direction="horizontal">
      <Panel defaultSize={15} minSize={10} maxSize={30}>
        {left}
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover:bg-accent-info transition-colors" />
      <Panel defaultSize={70} minSize={40}>
        {center}
      </Panel>
      <PanelResizeHandle className="w-1 bg-border hover:bg-accent-info transition-colors" />
      <Panel defaultSize={15} minSize={10} maxSize={30}>
        {right}
      </Panel>
    </PanelGroup>
  );
}
