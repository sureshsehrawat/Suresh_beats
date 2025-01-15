interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  min: number;
  max: number;
  step: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const Slider: React.FC<SliderProps>; 