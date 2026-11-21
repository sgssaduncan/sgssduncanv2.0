import React from 'react';
import DotacionModule from '../components/DotacionModule';
import ErrorBoundary from '../components/ErrorBoundary';

export default function DotacionPage() {
  return (
    <ErrorBoundary fallbackTitle="Módulo de Dotación, E.P.P. y Uniformes">
      <DotacionModule />
    </ErrorBoundary>
  );
}
