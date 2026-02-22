import PocketBase from 'pocketbase';

// Sesuaikan URL ini dengan alamat server PocketBase Anda (biasanya port 8090)
const pb = new PocketBase('http://127.0.0.1:8090');

export default pb;