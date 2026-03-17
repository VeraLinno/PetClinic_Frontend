import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../../src/layouts/MainLayout.vue';
// Mock router
const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
        { path: '/owner', name: 'owner', component: { template: '<div>Owner Dashboard</div>' } }
    ]
});
// Mock auth store
const mockAuthStore = {
    user: {
        id: '1',
        email: 'test@example.com',
        roles: ['Owner'],
        name: 'Test User'
    },
    roles: ['Owner'],
    isAuthenticated: true,
    logout: vi.fn().mockResolvedValue(undefined)
};
describe('MainLayout', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });
    it('renders sidebar and topbar', () => {
        const wrapper = mount(MainLayout, {
            global: {
                plugins: [router],
                provide: {
                    authStore: mockAuthStore
                },
                mocks: {
                // Mock the auth store
                }
            },
            data() {
                return {};
            }
        });
        // Check that sidebar is rendered
        expect(wrapper.find('aside[role="navigation"]').exists()).toBe(true);
        // Check that topbar is rendered  
        expect(wrapper.find('header').exists()).toBe(true);
        // Check that navigation links exist
        expect(wrapper.text()).toContain('Pet Clinic');
    });
    it('has proper navigation structure', () => {
        const wrapper = mount(MainLayout, {
            global: {
                plugins: [router]
            }
        });
        // Check for semantic elements
        expect(wrapper.find('nav[role="menubar"]').exists()).toBe(true);
        expect(wrapper.find('main[role="main"]').exists()).toBe(true);
    });
    it('contains user information section', () => {
        const wrapper = mount(MainLayout, {
            global: {
                plugins: [router]
            }
        });
        // Check for user-related content
        expect(wrapper.html()).toContain('Logout');
    });
});
