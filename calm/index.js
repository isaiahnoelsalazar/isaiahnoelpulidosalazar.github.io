const container = document.getElementById('particles');
for (let i = 0; i < 100; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  p.style.cssText = `
    left: ${Math.random()*100}%;
    animation-duration: ${8+Math.random()*14}s;
    animation-delay: ${-Math.random()*22}s;
    --dx: ${(Math.random()-0.5)*120}px;
    width: ${1+Math.random()*2}px;
    height: ${1+Math.random()*2}px;
    opacity: ${0.3+Math.random()*0.7};
    background: ${Math.random()>0.6 ? 'rgba(29,233,182,0.7)' : Math.random()>0.5 ? 'rgba(68,138,255,0.6)' : 'rgba(0,229,255,0.7)'};
    box-shadow: 0 0 ${4+Math.random()*6}px currentColor;
  `;
  container.appendChild(p);
}