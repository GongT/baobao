import { InputTestClient } from '../../clients/test-input.client.js';
import { TestClient } from '../../clients/test.client.js';

let flip_id = 0;
export function test_flipping(starting = 2000, interval = 2000, building = 1000) {
	return new TestClient(`fl${++flip_id}`, starting, interval, building, [true, false]);
}

let succ_id = 0;
export function test_always_success(starting = 2000, interval = 2000, building = 1000) {
	return new TestClient(`as${++succ_id}`, starting, interval, building, [true]);
}
export function test_success_quit(time = 2000) {
	return new TestClient(`s${++succ_id}`, time * 10, time * 10, time * 10, [true], { timeout: time, resolve: true });
}

let fail_id = 0;
export function test_always_fail(starting = 2000, interval = 2000, building = 1000) {
	return new TestClient(`af${++fail_id}`, starting, interval, building, [false]);
}
export function test_fail_quit(time = 2000) {
	return new TestClient(`f${++fail_id}`, time * 10, time * 10, time * 10, [true], { timeout: time, resolve: false });
}

let manual_id = 0;
export function test_manual() {
	return new InputTestClient(`manual-${++manual_id}`);
}
