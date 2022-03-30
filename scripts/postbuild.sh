mkdir ./react
mkdir ./types
mkdir ./nest

echo 'export * from "../dist/esm/index2";' > ./react/index.js
echo 'export * from "../dist/esm/index3";' > ./nest/index.js
echo 'export * from "./index.d";' > ./types/index.js

echo 'export * from "../dist/react";' > ./react/index.d.ts
echo 'export * from "../dist/nest";' > ./nest/index.d.ts
echo 'export * from "../dist/types";' > ./types/index.d.ts