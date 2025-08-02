'use client';

import { Box, Checkbox } from '@shopify/polaris';

interface CheckboxPickerProps {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  helpText?: string;
}

export default function CheckboxPicker({
  label,
  checked,
  onChange,
  helpText
}: CheckboxPickerProps) {
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