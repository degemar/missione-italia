import {StampButton, StampCard, StampMark, TheatreConfetti} from '../components/StampTheatre.js';

export function DevDesignSystem() {
  return (
    <main className="design-system" aria-labelledby="design-system-title">
      <header className="design-system__hero">
        <StampMark title="Sello de Missione Italia" />
        <div>
          <p className="eyebrow">Solo desarrollo</p>
          <h1 id="design-system-title">Taller de sellos</h1>
          <p>Estados y piezas reutilizables de Missione Italia.</p>
        </div>
      </header>
      <section className="design-system__grid" aria-label="Primitivas visuales">
        {(['paper', 'tomato', 'teal', 'gold', 'violet'] as const).map((tone) => (
          <StampCard key={tone} tone={tone} className="design-system__card">
            <p className="eyebrow">Tarjeta</p>
            <h2>{tone}</h2>
            <p>Una pieza de papel lista para una pista, logro o decisión.</p>
          </StampCard>
        ))}
      </section>
      <section className="design-system__actions" aria-label="Estados de botón">
        <StampButton tone="tomato">Empezar misión</StampButton>
        <StampButton tone="teal">Pista encontrada</StampButton>
        <StampButton tone="gold">Ganar sello</StampButton>
        <StampButton tone="violet">Modo adulto</StampButton>
        <StampButton tone="tomato" disabled>Esperando</StampButton>
      </section>
      <StampCard tone="teal" className="design-system__celebration">
        <TheatreConfetti />
        <StampMark title="Sello ganado" />
        <h2>¡Sello desbloqueado!</h2>
        <p>La animación se apaga con la preferencia de movimiento reducido.</p>
      </StampCard>
    </main>
  );
}
