import React from 'react';

// 简笔画猫咪头SVG组件
export const CatLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => (
  <svg 
    className={className} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 猫咪头部轮廓 - 使用与背景融合的颜色 */}
    <ellipse cx="50" cy="55" rx="35" ry="30" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2"/>
    
    {/* 猫咪耳朵 */}
    <path d="M25 35 L35 15 L45 35 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
    <path d="M55 35 L65 15 L75 35 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5"/>
    
    {/* 猫咪眼睛 */}
    <circle cx="40" cy="50" r="4" fill="#1F2937"/>
    <circle cx="60" cy="50" r="4" fill="#1F2937"/>
    <circle cx="42" cy="48" r="1.5" fill="#FFFFFF"/>
    <circle cx="62" cy="48" r="1.5" fill="#FFFFFF"/>
    
    {/* 猫咪鼻子 */}
    <path d="M50 58 L48 62 L52 62 Z" fill="#F59E0B"/>
    
    {/* 猫咪嘴巴 */}
    <path d="M45 65 Q50 68 55 65" stroke="#1F2937" strokeWidth="1.5" fill="none"/>
    
    {/* 猫咪胡须 */}
    <line x1="20" y1="55" x2="35" y2="53" stroke="#1F2937" strokeWidth="1"/>
    <line x1="20" y1="58" x2="35" y2="58" stroke="#1F2937" strokeWidth="1"/>
    <line x1="20" y1="61" x2="35" y2="63" stroke="#1F2937" strokeWidth="1"/>
    
    <line x1="80" y1="55" x2="65" y2="53" stroke="#1F2937" strokeWidth="1"/>
    <line x1="80" y1="58" x2="65" y2="58" stroke="#1F2937" strokeWidth="1"/>
    <line x1="80" y1="61" x2="65" y2="63" stroke="#1F2937" strokeWidth="1"/>
  </svg>
); 