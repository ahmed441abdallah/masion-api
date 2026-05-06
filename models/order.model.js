import mongoose from 'mongoose';
const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cartItems: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
        },
        price: Number,
        color: String,
      },
    ],
    totalOrderPrice: Number,

    shippingAddress: {
      type: Object,
      address: String,
      city: String,
      phone: String,
      required: true,
    },
    shippingPrice: {
      type: Number,
      default: 60,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card'],
      default: 'cash',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);
// populate user and cartItems.product
orderSchema.pre(/^find/, function () {
  this.populate({
    path: 'user',
    select: 'name email',
  });
  this.populate({
    path: 'cartItems.product',
    select: 'title imageCover',
  });
});
const Order = mongoose.model('Order', orderSchema);
export default Order;
