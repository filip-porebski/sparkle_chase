from playwright.sync_api import Page, expect


def create_hunt(page: Page, name: str, game: str, method: str):
    page.get_by_text("New Hunt").click()
    page.get_by_label("Target Species").fill(name)
    page.get_by_label("Game").select_option(label=game)
    page.get_by_label("Method").select_option(label=method)
    page.get_by_text("Create Hunt").click()


def test_increment_decrement_and_round_shine(page: Page):
    create_hunt(page, 'Ralts', 'Platinum', 'Random Encounters')

    # +1 and −1 work
    plus = page.get_by_text('+1')
    plus.click(); plus.click(); plus.click()
    # Expect count shows 3
    expect(page.get_by_text('3')).to_be_visible()

    page.get_by_text('−1').click()
    expect(page.get_by_text('2')).to_be_visible()

    # Click until divisible by 10, shine overlay appears
    for _ in range(8):
        plus.click()
    # We should see the shine overlay element
    expect(page.locator('.sc-hero-shine')).to_be_attached()


def test_phase_logging_and_delete(page: Page):
    create_hunt(page, 'Cloyster', 'Leaf Green', 'Random Encounters')
    # Add some counts
    for _ in range(5):
        page.get_by_text('+1').click()

    # Log Phase (off-target)
    page.get_by_text('Phase').click()
    modal = page.locator('.sc-modal')
    modal.get_by_label('Species Found').fill('Pidgey')
    modal.get_by_text('Log Phase').click()

    # Recent Phases section visible
    expect(page.get_by_text('Recent Phases')).to_be_visible()
    expect(page.get_by_text('Pidgey')).to_be_visible()

    # Delete the phase via the X button
    page.locator('.sc-phase').locator('button', has_text='×').click()
    page.on('dialog', lambda d: d.accept())
    # List may be empty now
    # (Section hides itself when no phases)

