import '@xterm/xterm/css/xterm.css';
import { TypeRaceApp } from './app';

const container = document.getElementById('terminal');
if (container) {
  const app = new TypeRaceApp(container);
  app.start();
}
