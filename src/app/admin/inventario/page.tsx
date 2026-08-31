import { Suspense } from 'react';
import { InventarioTabla } from './InventarioTabla';

export default function InventarioPage() {
  return (
    <Suspense>
      <InventarioTabla />
    </Suspense>
  );
}
