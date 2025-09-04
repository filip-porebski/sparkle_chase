from playwright.sync_api import Page


def create_basic_hunts(page: Page):
    # Open New Hunt and create several
    page.get_by_text("New Hunt").click()
    page.get_by_label("Target Species").fill("Ralts")
    page.get_by_label("Game").select_option(label="Platinum")
    page.get_by_label("Method").select_option(label="Random Encounters")
    page.get_by_text("Create Hunt").click()

    page.get_by_text("New Hunt").click()
    page.get_by_label("Target Species").fill("Cloyster")
    page.get_by_label("Game").select_option(label="Leaf Green")
    page.get_by_label("Method").select_option(label="Random Encounters")
    page.get_by_text("Create Hunt").click()

    page.get_by_text("New Hunt").click()
    page.get_by_label("Target Species").fill("Arceus")
    page.get_by_label("Game").select_option(label="Ultra Sun")
    page.get_by_label("Method").select_option(label="Random Encounters")
    page.get_by_text("Create Hunt").click()


def test_inline_filter_and_search_modal(page: Page):
    create_basic_hunts(page)

    # Filter completed/active (initially all active)
    page.get_by_text("Filter").click()
    page.get_by_text("Completed").click()
    assert page.get_by_text("No hunts match the current filter.").is_visible()
    page.get_by_text("All").click()

    # Quick Switch via Search button
    page.get_by_text("Search").click()
    dlg = page.locator('.sc-modal')
    assert dlg.is_visible()
    dlg.get_by_placeholder("Search hunts").fill("cloy")
    assert dlg.get_by_text("Cloyster").is_visible()
    dlg.get_by_text("Cloyster Hunt").click()
    # Selecting closes modal
    page.wait_for_selector('.sc-modal', state='detached')


def test_quick_switch_shortcut(page: Page):
    create_basic_hunts(page)
    # Cmd/Ctrl+K opens dialog
    page.keyboard.press('Meta+KeyK') if page.context.browser_name == 'webkit' else page.keyboard.press('Control+KeyK')
    assert page.locator('.sc-modal').is_visible()
    page.keyboard.type('ral')
    assert page.locator('.sc-modal').get_by_text('Ralts').is_visible()
    page.keyboard.press('Enter')
    page.wait_for_selector('.sc-modal', state='detached')

