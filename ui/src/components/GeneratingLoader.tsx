import { useEffect, useState } from 'react';
import './GeneratingLoader.css';

const SCAN_MESSAGES = [
  'カカロット... スキャン中',
  'SAIYAJIN DNA CONFIRMED',
  'ベジータ: 戦闘力... 測定不能',
  'ZENKAI BOOST CALCULATING',
  '超サイヤ人 PROTOCOL ACTIVE',
  'HYPERBOLIC TIME SYNC...',
  'バトルパワー 計測中',
  'POWER EXCEEDING LIMITS',
  'サイヤ人 GENE SEQUENCE MAPPED',
  'FRIEZA FORCE THREAT DETECTED',
  '界王拳 MULTIPLIER LOADING',
  'FINAL FLASH CHARGED: 99%',
  'ナメック星 DATABASE SYNCED',
  'GRAVITY ROOM CALIBRATED',
  'SPIRIT BOMB CHARGING...',
  'TIME CHAMBER ACCESS GRANTED',
];

const SCAN_STATS = [
  'BIO-METRICS......... [OK]',
  'COMBAT CLASS........ [S]',
  'ZENKAI POTENTIAL.... [∞]',
  'TAIL STATUS......... [—]',
  'SAIYAN BLOOD........ [PURE]',
  'POWER CEILING....... [NONE]',
];

export default function GeneratingLoader() {
  const [msgIdx, setMsgIdx] = useState(0);
  const [statIdx, setStatIdx] = useState(0);
  const [power, setPower] = useState(9001);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const msgTimer = setInterval(() => setMsgIdx((i) => (i + 1) % SCAN_MESSAGES.length), 1800);
    const statTimer = setInterval(() => setStatIdx((i) => (i + 1) % SCAN_STATS.length), 2400);
    const powerTimer = setInterval(() => setPower((p) => p + Math.floor(Math.random() * 480000 + 20000)), 120);
    const dotsTimer = setInterval(() => setDots((d) => (d.length >= 3 ? '' : d + '.')), 400);

    return () => {
      clearInterval(msgTimer);
      clearInterval(statTimer);
      clearInterval(powerTimer);
      clearInterval(dotsTimer);
    };
  }, []);

  return (
    <div className="gen-loader">
      <div className="gen-loader__eyebrow pixel-text">KAKAROT INITIALIZING PROGRAM{dots}</div>

      <div className="scouter-stage">
        {/* Corner reticle marks */}
        <span className="reticle reticle--tl" />
        <span className="reticle reticle--tr" />
        <span className="reticle reticle--bl" />
        <span className="reticle reticle--br" />

        {/* Top measurement lines */}
        <div className="scouter-hline scouter-hline--top" />
        <div className="scouter-hline scouter-hline--bottom" />

        {/* Goku figure */}
        <div className="scouter-figure">
          <img src="/goku.png" alt="Goku" className="scouter-figure__img" />
          <div className="scouter-figure__scan-line" />
          <div className="scouter-figure__glow" />
        </div>

        {/* Live stat floating over figure */}
        <div className="scouter-stat-badge pixel-text">{SCAN_STATS[statIdx]}</div>
      </div>

      {/* Power level readout */}
      <div className="scouter-power">
        <span className="scouter-power__label pixel-text">BATTLE POWER</span>
        <span className="scouter-power__value">{power.toLocaleString()}</span>
        <div className="scouter-power__bar">
          <div className="scouter-power__fill" />
        </div>
      </div>

      {/* Cycling Saiyan message */}
      <div className="scouter-message pixel-text">{SCAN_MESSAGES[msgIdx]}</div>
    </div>
  );
}
