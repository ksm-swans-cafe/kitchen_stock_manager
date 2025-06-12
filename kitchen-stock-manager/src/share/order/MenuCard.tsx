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
          <div className="subtitle is-7 tag is-pulled-right">Status</div>
        </div>
        <div className="mx-2 my-2">
          <div className="">
            <div className="subtitle is-7">{title}</div>
            <div className="subtitle is-7">{description}</div>
            {/* total - unit */}
            <div className="subtitle is-7">total 25  unit</div>
            {/* time */}
            <span className="subtitle is-7 ">??-??-????</span>
            {/* status */}
            
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