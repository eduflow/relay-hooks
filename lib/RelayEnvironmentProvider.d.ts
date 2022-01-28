import React from 'react';
import { Environment } from 'relay-runtime';
export declare const RelayEnvironmentProvider: <TEnvironment extends Environment = Environment>(props: {
    children: React.ReactNode;
    environment: TEnvironment;
}) => JSX.Element;
