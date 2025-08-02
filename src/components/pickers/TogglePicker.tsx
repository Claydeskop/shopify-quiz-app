'use client';

import { Box, Checkbox } from '@shopify/polaris';

interface TogglePickerProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  helpText?: string;
}

export default function TogglePicker({
  label,
  checked,
  onChange,
  helpText
}: TogglePickerProps) {
  return (
    <Box paddingBlockStart="400" paddingBlockEnd="400">
      <Checkbox
        label={label}
        checked={checked}
        onChange={onChange}
        helpText={helpText}
      />
    </Box>
  );
}