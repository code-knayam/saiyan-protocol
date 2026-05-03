import './PowerLevel.css';

interface PowerLevelProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function PowerLevel({ level, size = 'md' }: PowerLevelProps) {
  const tier = getPowerTier(level);
  const pct = Math.min((level / 10000) * 100, 100);

  return (
    <div className={`scouter scouter--${size} scouter--${tier.id}`}>
      {/* Scouter glass background */}
      <div className="scouter__glass" />

      {/* Scan lines */}
      <div className="scouter__scanlines" />

      {/* Corner targeting brackets */}
      <div className="scouter__bracket scouter__bracket--tl" />
      <div className="scouter__bracket scouter__bracket--tr" />
      <div className="scouter__bracket scouter__bracket--bl" />
      <div className="scouter__bracket scouter__bracket--br" />

      {/* Wandering crosshairs */}
      <div className="scouter__crosshair scouter__crosshair--1" />
      <div className="scouter__crosshair scouter__crosshair--2" />

      {/* Horizontal scan sweep */}
      <div className="scouter__sweep" />

      {/* Side data readouts */}
      <div className="scouter__hud-left">
        <span>BLK:01</span>
        <span>WK:01</span>
      </div>

      <div className="scouter__hud-right">
        <span>TGT:LOCK</span>
        <span>{pct.toFixed(0)}%</span>
      </div>

      {/* Main content */}
      <div className="scouter__content">
        <div className="scouter__label">POWER LEVEL</div>
        <div className="scouter__readout">
          <span className="scouter__arrow">◂</span>
          <span className="scouter__value">{level.toLocaleString()}</span>
          <span className="scouter__arrow">▸</span>
        </div>
        <div className="scouter__tier">{tier.name}</div>
      </div>

      {/* Bottom bar with stat mini-bars */}
      <div className="scouter__footer">
        <div className="scouter__bar">
          <div className="scouter__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <div className="scouter__mini-stats">
          <div className="scouter__mini-stat">
            <span>STR</span>
            <div className="scouter__mini-bar"><div style={{ width: '60%' }} /></div>
          </div>
          <div className="scouter__mini-stat">
            <span>SPD</span>
            <div className="scouter__mini-bar"><div style={{ width: '45%' }} /></div>
          </div>
          <div className="scouter__mini-stat">
            <span>END</span>
            <div className="scouter__mini-bar"><div style={{ width: '55%' }} /></div>
          </div>
        </div>
      </div>

      {/* Bottom coords */}
      <div className="scouter__coords">
        <span>X:28.61</span>
        <span>Y:77.20</span>
      </div>
    </div>
  );
}

interface PowerTier {
  id: string;
  name: string;
  minLevel: number;
}

function getPowerTier(level: number): PowerTier {
  if (level >= 10000) return { id: 'ultra', name: 'ULTRA INSTINCT', minLevel: 10000 };
  if (level >= 7500) return { id: 'ssjblue', name: 'SSJ BLUE', minLevel: 7500 };
  if (level >= 5000) return { id: 'ssj3', name: 'SSJ 3', minLevel: 5000 };
  if (level >= 3000) return { id: 'ssj2', name: 'SSJ 2', minLevel: 3000 };
  if (level >= 1500) return { id: 'ssj', name: 'SUPER SAIYAN', minLevel: 1500 };
  return { id: 'base', name: 'SAIYAN', minLevel: 0 };
}
