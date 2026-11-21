import React from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { RotateCcw } from 'lucide-react';

interface SignaturePadProps {
  label: string;
  onSave: (base64: string) => void;
  defaultValue?: string;
}

export default function SignaturePad({ label, onSave, defaultValue }: SignaturePadProps) {
  const sigPad = React.useRef<SignatureCanvas>(null);
  const [hasLoadedDefault, setHasLoadedDefault] = React.useState(false);

  React.useEffect(() => {
    if (defaultValue && sigPad.current && !hasLoadedDefault) {
      sigPad.current.fromDataURL(defaultValue);
      setHasLoadedDefault(true);
    } else if (!defaultValue && !hasLoadedDefault) {
      // If we render with no default value, we still mark it as loaded
      // so that we don't try to load the user's drawing as a default value later.
      setHasLoadedDefault(true);
    }
  }, [defaultValue, hasLoadedDefault]);

  const clear = () => {
    sigPad.current?.clear();
    onSave('');
  };

  const handleEnd = () => {
    if (sigPad.current?.isEmpty()) {
      onSave('');
      return;
    }
    const data = sigPad.current?.getCanvas().toDataURL('image/png');
    if (data) onSave(data);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden relative">
        <SignatureCanvas
          ref={sigPad}
          penColor="#1e293b"
          onEnd={handleEnd}
          clearOnResize={false}
          canvasProps={{
            className: "w-full h-40 cursor-crosshair"
          }}
        />
        
        <div className="absolute bottom-2 right-2 flex gap-2">
          <button 
            onClick={clear}
            className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shadow-sm"
            title="Limpiar"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
