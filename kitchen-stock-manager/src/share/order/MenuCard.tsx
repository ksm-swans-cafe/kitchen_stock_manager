import { MenuItem } from "@/models/order/menu-model";

export default function MenuCard({
  title,
  imageUrl = "https://bulma.io/assets/images/placeholders/1280x960.png",
  description,
}: MenuItem) {
  return (
    <div className="column is-full-mobile is-one-third-tablet is-one-fifth-desktop is-one-sixth-widescreen">

      <div className="card" style={{ height: "100%" }}>
        <div className="card-image">
          <figure className="image is-4by3">
              <img src={imageUrl} alt={title} />
          </figure>
        </div>
        <div className="card-content">
          <div className="content">
            <p className="title is-7">{title}</p>
            <p className="subtitle is-7">{description}</p>
          </div>
        </div>
        <footer className="card-footer">
          <a href="#" className="card-footer-item">Add</a>
          <a href="#" className="card-footer-item">Edit</a>
        </footer>
      </div>
    </div>
  );
}