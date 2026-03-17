import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PetCard from '../../src/components/PetCard.vue'

// Mock pet data
const mockPet = {
  id: '1',
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  dateOfBirth: '2020-05-15',
  ownerId: 'owner-1'
}

describe('PetCard', () => {
  it('renders pet name correctly', () => {
    const wrapper = mount(PetCard, {
      props: {
        pet: mockPet
      }
    })

    expect(wrapper.text()).toContain('Buddy')
  })

  it('renders pet species and breed', () => {
    const wrapper = mount(PetCard, {
      props: {
        pet: mockPet
      }
    })

    expect(wrapper.text()).toContain('Dog')
    expect(wrapper.text()).toContain('Golden Retriever')
  })

  it('renders Book button', () => {
    const wrapper = mount(PetCard, {
      props: {
        pet: mockPet
      }
    })

    const bookButton = wrapper.find('button')
    expect(bookButton.exists()).toBe(true)
    expect(bookButton.text()).toContain('Book')
  })

  it('emits book-appointment event when Book button is clicked', async () => {
    const wrapper = mount(PetCard, {
      props: {
        pet: mockPet
      }
    })

    const bookButton = wrapper.find('button')
    await bookButton.trigger('click')

    expect(wrapper.emitted('book-appointment')).toBeTruthy()
    expect(wrapper.emitted('book-appointment')?.[0]).toEqual([mockPet])
  })

  it('displays correct emoji for dog species', () => {
    const wrapper = mount(PetCard, {
      props: {
        pet: mockPet
      }
    })

    expect(wrapper.text()).toContain('🐕')
  })

  it('displays correct emoji for cat species', () => {
    const catPet = { ...mockPet, species: 'Cat', breed: 'Persian' }
    const wrapper = mount(PetCard, {
      props: {
        pet: catPet
      }
    })

    expect(wrapper.text()).toContain('🐱')
  })
})
