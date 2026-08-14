import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ControlKnob } from './ControlKnob';

function renderKnob(props: Partial<Parameters<typeof ControlKnob>[0]> = {}) {
  const onChange = vi.fn();
  const utils = render(
    <ControlKnob
      label="GAIN"
      value={0.5}
      min={0}
      max={1}
      step={0.01}
      color="#00ff41"
      defaultValue={0.7}
      onChange={onChange}
      {...props}
    />,
  );
  return { onChange, ...utils };
}

describe('ControlKnob', () => {
  it('exposes slider semantics with a label', () => {
    renderKnob();
    const slider = screen.getByRole('slider', { name: 'GAIN' });
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '1');
    expect(slider).toHaveAttribute('aria-valuenow', '0.5');
  });

  it('increments on ArrowUp', () => {
    const { onChange } = renderKnob();
    const slider = screen.getByRole('slider', { name: 'GAIN' });
    fireEvent.keyDown(slider, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(0.51);
  });

  it('decrements on ArrowDown', () => {
    const { onChange } = renderKnob();
    const slider = screen.getByRole('slider', { name: 'GAIN' });
    fireEvent.keyDown(slider, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(0.49);
  });

  it('jumps to the maximum on End', () => {
    const { onChange } = renderKnob();
    const slider = screen.getByRole('slider', { name: 'GAIN' });
    fireEvent.keyDown(slider, { key: 'End' });
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('resets to the default on double-click', () => {
    const { onChange } = renderKnob();
    const slider = screen.getByRole('slider', { name: 'GAIN' });
    fireEvent.doubleClick(slider);
    expect(onChange).toHaveBeenCalledWith(0.7);
  });
});
