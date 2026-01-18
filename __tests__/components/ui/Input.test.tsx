import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

expect.extend(toHaveNoViolations);

describe('Input Component', () => {
  describe('Rendering', () => {
    it('renders input element', () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('renders with different types', () => {
      const { rerender } = render(<Input type="email" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

      rerender(<Input type="password" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

      rerender(<Input type="number" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });

    it('renders as disabled', () => {
      render(<Input disabled placeholder="Disabled input" />);
      const input = screen.getByPlaceholderText('Disabled input');
      expect(input).toBeDisabled();
    });

    it('applies custom className', () => {
      render(<Input className="custom-class" data-testid="input" />);
      expect(screen.getByTestId('input')).toHaveClass('custom-class');
    });
  });

  describe('Interactions', () => {
    it('handles user input', async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Type here" />);

      const input = screen.getByPlaceholderText('Type here');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('calls onChange handler', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} placeholder="Test input" />);
      const input = screen.getByPlaceholderText('Test input');

      await user.type(input, 'abc');

      expect(handleChange).toHaveBeenCalledTimes(3);
    });

    it('supports controlled input', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      const { rerender } = render(
        <Input value="initial" onChange={handleChange} data-testid="input" />
      );

      expect(screen.getByTestId('input')).toHaveValue('initial');

      rerender(
        <Input value="updated" onChange={handleChange} data-testid="input" />
      );

      expect(screen.getByTestId('input')).toHaveValue('updated');
    });

    it('does not accept input when disabled', async () => {
      const user = userEvent.setup();
      render(<Input disabled placeholder="Disabled" />);

      const input = screen.getByPlaceholderText('Disabled');
      await user.type(input, 'test');

      expect(input).toHaveValue('');
    });
  });

  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </>
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('associates with label via id', () => {
      render(
        <>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" />
        </>
      );

      const input = screen.getByLabelText('Email Address');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'email');
    });

    it('supports aria-label', () => {
      render(<Input aria-label="Search input" />);
      expect(screen.getByLabelText('Search input')).toBeInTheDocument();
    });

    it('supports aria-describedby for error messages', () => {
      render(
        <>
          <Input
            aria-describedby="error-message"
            aria-invalid="true"
            data-testid="input"
          />
          <span id="error-message">This field is required</span>
        </>
      );

      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-describedby', 'error-message');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAccessibleDescription('This field is required');
    });

    it('supports aria-required', () => {
      render(<Input required aria-required="true" data-testid="input" />);
      const input = screen.getByTestId('input');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toBeRequired();
    });
  });

  describe('Form Integration', () => {
    it('submits form with input value', async () => {
      const handleSubmit = vi.fn((e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        return formData.get('username');
      });

      const user = userEvent.setup();

      render(
        <form onSubmit={handleSubmit}>
          <Input name="username" placeholder="Username" />
          <button type="submit">Submit</button>
        </form>
      );

      const input = screen.getByPlaceholderText('Username');
      await user.type(input, 'john_doe');

      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);

      expect(handleSubmit).toHaveBeenCalled();
    });

    it('respects maxLength attribute', async () => {
      const user = userEvent.setup();

      render(<Input maxLength={5} data-testid="input" />);
      const input = screen.getByTestId('input') as HTMLInputElement;

      await user.type(input, '1234567890');

      expect(input.value).toHaveLength(5);
      expect(input.value).toBe('12345');
    });

    it('validates email format with type="email"', () => {
      render(<Input type="email" data-testid="email-input" />);
      const input = screen.getByTestId('email-input') as HTMLInputElement;

      input.value = 'invalid-email';
      expect(input.validity.valid).toBe(false);

      input.value = 'valid@email.com';
      expect(input.validity.valid).toBe(true);
    });
  });
});
