import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { SynthProvider } from '../../state/SynthProvider';
import { OscillatorPanel } from './OscillatorPanel';

function renderPanel() {
  return render(
    <SynthProvider>
      <OscillatorPanel />
    </SynthProvider>,
  );
}

/** Scope a query to the OSC-1 fieldset. */
function osc1Section() {
  const heading = screen.getByText('OSC-1');
  const fieldset = heading.closest('fieldset');
  expect(fieldset).not.toBeNull();
  return within(fieldset as HTMLElement);
}

describe('OscillatorPanel', () => {
  it('renders both oscillator sections', () => {
    renderPanel();
    expect(screen.getByText('OSC-1')).toBeInTheDocument();
    expect(screen.getByText('OSC-2')).toBeInTheDocument();
  });

  it('marks the active waveform as pressed', () => {
    renderPanel();
    // Default osc1 waveform is sawtooth -> "SAW".
    expect(osc1Section().getByRole('button', { name: 'SAW' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches the oscillator waveform on click', () => {
    renderPanel();
    const square = osc1Section().getByRole('button', { name: 'SQU' });
    fireEvent.click(square);
    expect(square).toHaveAttribute('aria-pressed', 'true');
  });
});
