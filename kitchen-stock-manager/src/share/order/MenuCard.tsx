import { MenuItem, ingredient } from "@/models/menu_card/MenuCard-model";

type Mode = "menu" | "ingredient";

interface MenuCardProps {
  mode: Mode;
  item: MenuItem | ingredient;
}

export default function MenuCard({
  mode,
  item,
}: MenuCardProps) {
  let title: string | undefined;
  let imageUrl: string | undefined;
  let description: string | undefined;
  let total: string | number | undefined;
  let unit: string | undefined;
  let lastUpdate: string | undefined;

  if (mode === "menu") {
    const menuItem = item as MenuItem;
    title = menuItem.menu_name;
    imageUrl = menuItem.imageUrl;
    description = menuItem.description;
    total = menuItem.menu_total;
  } else {
    const ingredientItem = item as ingredient;
    title = ingredientItem.ingredient_name;
    imageUrl = ingredientItem.ingredient_image;
    total = ingredientItem.ingredient_total;
    unit = ingredientItem.ingredient_unit;
    lastUpdate = ingredientItem.ingredient_lastupdate;
  }

  return (
    <div className="column is-full-mobile is-one-third-tablet is-one-fifth-desktop is-one-sixth-widescreen">
      <div className="card" style={{ height: "100%" }}>
        <div className="card-image">
          <figure className="image is-4by3">
            <img
              src={
                imageUrl ||
                "https://bulma.io/assets/images/placeholders/1280x960.png"
              }
              alt={title}
            />
          </figure>
          <div className="subtitle is-7 tag is-pulled-right">Status</div>
        </div>
        <div className="mx-2 my-2">
          <div>
            <div className="subtitle is-7">{title}</div>
            {mode === "menu" && (
              <div className="subtitle is-7">{description}</div>
            )}
            <div className="subtitle is-7">
              total {total} {unit}
            </div>
            {mode === "ingredient" && (
              <span className="subtitle is-7">{lastUpdate}</span>
            )}
          </div>
        </div>
        <footer className="card-footer">
          <a href="#" className="card-footer-item">
            Add
          </a>
          <a href="#" className="card-footer-item">
            Edit
          </a>
        </footer>
      </div>
    </div>
  );
}
