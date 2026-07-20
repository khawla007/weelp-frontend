# Mini Cart Single Booking Edit Design

## What this guide covers

Weelp checkout already expects one booking at a time. The mini cart should match that rule instead of allowing multiple lines and asking the user to clean it up later.

This change makes the mini cart a single-booking cart for active website flows. When a user adds a new itinerary, activity, or transfer, it replaces the current cart item. Packages are not part of the public booking flow, so this design does not add package-specific behavior.

## The edit action

The edit icon should only appear when it can do something useful. For itinerary and activity cart lines, edit sends the user back to the public item page using the existing URL hierarchy:

`/cities/[city-slug]/[item-type]/[item-slug]?editCartItem=[id]`

The cart item already stores `city_slug` and `slug` for itineraries. Activities should store the same fields when added. If a cart line does not have enough routing data, the edit action is hidden.

The edit page restores the existing cart line into the product sidebar. Travelers, date range, and matching add-ons are preselected from the persisted cart item. Re-submitting the form replaces the current line because the cart is now single-booking.

## Single-booking behavior

`addItem` should replace the cart with the new normalized item, not append a second item. Updating the same item still works because replacing the line with the submitted selection is the intended behavior.

The checkout page can keep its defensive multiple-item guard for old persisted carts. The mini-cart add path should prevent new multiple-item states.

## User feedback

Adding any item should continue to open the mini cart. The toast can keep saying the item was added; a later copy pass can distinguish first add from replacement if needed.

The delete action stays unchanged.

## Testing

Focused tests should cover:

- `addItem` replaces an existing cart item and recomputes total from the single line.
- `MiniCartProductCard` renders an edit link for activity/itinerary cart lines with `city_slug` and `slug`.
- `MiniCartProductCard` hides the edit action for package lines and incomplete routing data.
- `ProductSidebar` restores an editable cart line from `editCartItem`.
- Existing delete confirmation behavior still works.
