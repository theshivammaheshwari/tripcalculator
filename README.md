# Trip Cost Calculator

A simple and efficient trip cost calculator built with React. This tool helps users estimate the total cost of a trip, including fuel expenses, accommodation, and other miscellaneous costs.

## Features
- 🚗 Calculate total trip cost based on distance and fuel price
- 🏨 Include accommodation and food expenses
- 📊 Interactive and easy-to-use interface
- ⚡ Fast and responsive design with animations

## 🛠️ Technologies Used
- React.js
- Vite
- Tailwind CSS
- GitHub Pages

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/theshivammaheshwari/tripcalculator.git
   cd tripcalculator
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Start the development server:
   ```sh
   npm start
   ```

## Deployment
If you are deploying using GitHub Pages, update your `package.json` file:

```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

If you have `vite.config.ts` (TypeScript version), add the following:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tripcalculator/', // ← Add this line
});
```

If you have `vite.config.js` (JavaScript version), add the following:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/tripcalculator/', // ← Add this line
});
```

Then deploy using:

```sh
npm run deploy
```

## Usage
- Enter trip details such as distance, fuel efficiency, and cost per unit
- Add accommodation and food costs
- Get an estimated total cost for your trip

## 🤝 Contribution
Feel free to contribute by submitting issues or pull requests. Happy coding! 🚀

## License
This project is licensed under the MIT License.
