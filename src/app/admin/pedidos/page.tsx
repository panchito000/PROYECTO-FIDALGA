import { Suspense } from 'react';
import { PedidosTabla } from './PedidosTabla';

export default function PedidosPage() {
  return (
    <Suspense>
      <PedidosTabla />
    </Suspense>
  );
}
