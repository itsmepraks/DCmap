import RAPIER from '@dimforge/rapier3d-compat'

// Exercise the actual WASM character controller used by the world, not a mock.
describe('world character physics', () => {
  beforeAll(async () => { await RAPIER.init() })
  it.each([7,18,54])('stops at walls at %s meters per second', (speed) => {
    const world = new RAPIER.World({ x: 0, y: -20, z: 0 })
    world.createCollider(RAPIER.ColliderDesc.cuboid(20, 0.5, 20).setTranslation(0, -0.5, 0))
    world.createCollider(RAPIER.ColliderDesc.cuboid(0.5, 4, 5).setTranslation(3, 4, 0))
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0.9, 0))
    const shape = world.createCollider(RAPIER.ColliderDesc.capsule(0.55, 0.3), body)
    const control = world.createCharacterController(0.025)
    control.enableAutostep(0.4, 0.3, false)
    control.enableSnapToGround(0.4)
    world.step()
    for (let i = 0; i < 180; i++) {
      control.computeColliderMovement(shape, { x: speed / 60, y: -0.01, z: 0 })
      const delta = control.computedMovement(), p = body.translation()
      body.setNextKinematicTranslation({ x: p.x + delta.x, y: p.y + delta.y, z: p.z + delta.z })
      world.step()
    }
    expect(body.translation().x).toBeGreaterThan(2)
    expect(body.translation().x).toBeLessThan(2.25)
    expect(control.computedGrounded()).toBe(true)
    world.free()
  })
  it('climbs the memorial-sized 22 cm steps', () => {
    const world = new RAPIER.World({ x: 0, y: -20, z: 0 })
    world.createCollider(RAPIER.ColliderDesc.cuboid(20, 0.5, 20).setTranslation(0, -0.5, 0))
    for (let i = 0; i < 5; i++) world.createCollider(RAPIER.ColliderDesc.cuboid(0.625, (i + 1) * 0.11, 5).setTranslation(2 + i * 1.25, (i + 1) * 0.11, 0))
    const body = world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(0, 0.9, 0))
    const shape = world.createCollider(RAPIER.ColliderDesc.capsule(0.55, 0.3), body)
    const control = world.createCharacterController(0.025)
    control.enableAutostep(0.4, 0.3, false); control.enableSnapToGround(0.4)
    world.step()
    for (let i = 0; i < 145; i++) {
      control.computeColliderMovement(shape, { x: 0.05, y: -0.01, z: 0 })
      const delta = control.computedMovement(), p = body.translation()
      body.setNextKinematicTranslation({ x: p.x + delta.x, y: p.y + delta.y, z: p.z + delta.z }); world.step()
    }
    expect(body.translation().x).toBeGreaterThan(6)
    expect(body.translation().y).toBeGreaterThan(1.8)
    world.free()
  })
})
